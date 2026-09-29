import os
import sys
import unicodedata
from django.conf import settings
from django.core.management.base import BaseCommand
from movie.models import Movie


def normalize(text):
    """Normaliza un texto para comparar: minusculas, sin acentos y sin caracteres corruptos."""
    text = text.lower().strip()
    # Descompone acentos y elimina los diacriticos
    text = unicodedata.normalize("NFKD", text)
    text = "".join(c for c in text if not unicodedata.combining(c))
    # Deja solo letras y numeros para tolerar caracteres corruptos, espacios y puntuacion
    return "".join(c for c in text if c.isalnum())


class Command(BaseCommand):
    help = "Asigna a cada pelicula la imagen correspondiente de media/movie/images/"

    def _safe_write(self, stream, message):
        """Escribe en consola evitando fallos de codificacion en Windows"""
        try:
            stream.write(message)
        except UnicodeEncodeError:
            encoding = getattr(getattr(stream, "_out", None), "encoding", None) or "utf-8"
            safe = message.encode(encoding, errors="replace").decode(encoding, errors="replace")
            stream.write(safe)

    def handle(self, *args, **options):
        # Fuerza UTF-8 en la salida estandar cuando es posible
        for stream in (sys.stdout, sys.stderr):
            reconfigure = getattr(stream, "reconfigure", None)
            if callable(reconfigure):
                try:
                    reconfigure(encoding="utf-8", errors="replace")
                except Exception:
                    pass

        images_dir = os.path.join(settings.MEDIA_ROOT, "movie", "images")

        # Verifica que la carpeta exista
        if not os.path.isdir(images_dir):
            self._safe_write(self.stderr, f"Image folder not found: {images_dir}")
            return

        # Indexa los archivos de la carpeta por su nombre normalizado
        files = [f for f in os.listdir(images_dir) if os.path.isfile(os.path.join(images_dir, f))]
        index = {}
        for f in files:
            base = os.path.splitext(f)[0]  # sin extension
            if base.startswith("m_"):
                base = base[2:]  # quita el prefijo m_
            index[normalize(base)] = f

        movies = Movie.objects.all()
        self._safe_write(self.stdout, f"Found {movies.count()} movies in DB and {len(files)} images in folder")

        updated_count = 0
        for movie in movies:
            try:
                key = normalize(movie.title)
                file_name = index.get(key)

                # Coincidencia por prefijo para nombres truncados
                if file_name is None:
                    for norm_name, real_name in index.items():
                        if key.startswith(norm_name) or norm_name.startswith(key):
                            file_name = real_name
                            break

                if file_name is None:
                    self._safe_write(self.stderr, f"Image not found for: {movie.title}")
                    continue

                # Asigna la ruta relativa (respecto a MEDIA_ROOT) y guarda
                movie.image = f"movie/images/{file_name}"
                movie.save()
                updated_count += 1

                self._safe_write(self.stdout, self.style.SUCCESS(f"Updated image: {movie.title}"))

            except Exception as e:
                self._safe_write(self.stderr, f"Failed for {movie.title}: {str(e)}")

        self._safe_write(
            self.stdout,
            self.style.SUCCESS(f"Finished: {updated_count} movies updated with images from folder."),
        )
