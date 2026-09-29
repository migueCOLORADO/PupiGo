import os
import csv
import sys
from django.conf import settings
from django.core.management.base import BaseCommand
from movie.models import Movie


class Command(BaseCommand):
    help = "Update movie descriptions in the database from a CSV file"

    def _find_csv(self, filename):
        """Busca el CSV en la raiz del proyecto Django y luego en ../aux_files."""
        candidates = [
            filename,  # ruta relativa al directorio de ejecucion
            os.path.join(settings.BASE_DIR, filename),  # raiz del proyecto Django
            os.path.join(os.path.dirname(settings.BASE_DIR), "aux_files", filename),  # aux_files
        ]
        for path in candidates:
            if os.path.exists(path):
                return path
        return None

    def _safe_write(self, stream, message):
        """Escribe en consola evitando fallos de codificacion en Windows (cp1252)."""
        try:
            stream.write(message)
        except UnicodeEncodeError:
            encoding = getattr(stream._out, "encoding", None) or "utf-8"
            safe = message.encode(encoding, errors="replace").decode(encoding, errors="replace")
            stream.write(safe)

    def handle(self, *args, **kwargs):
        # Fuerza UTF-8 en la salida estandar cuando es posible (Python 3.7+)
        for stream in (sys.stdout, sys.stderr):
            reconfigure = getattr(stream, "reconfigure", None)
            if callable(reconfigure):
                try:
                    reconfigure(encoding="utf-8", errors="replace")
                except Exception:
                    pass

        # Nombre del archivo CSV con las descripciones actualizadas
        csv_file = "updated_movie_descriptions.csv"

        # Verifica si el archivo existe (en la raiz del proyecto o en aux_files)
        csv_path = self._find_csv(csv_file)
        if csv_path is None:
            self._safe_write(self.stderr, f"CSV file '{csv_file}' not found.")
            return

        updated_count = 0

        # Abrimos el CSV y leemos cada fila
        with open(csv_path, mode="r", encoding="utf-8") as file:
            reader = csv.DictReader(file)
            rows = list(reader)
            self._safe_write(self.stdout, f"Found {len(rows)} movies in CSV")

            for row in rows:
                title = row["Title"]
                new_description = row["Updated Description"]

                self._safe_write(self.stdout, f"Processing: {title}")

                try:
                    # Busca la pelicula por titulo
                    movie = Movie.objects.get(title=title)

                    # Actualiza la descripcion de la pelicula
                    movie.description = new_description
                    movie.save()
                    updated_count += 1

                    self._safe_write(self.stdout, self.style.SUCCESS(f"Updated: {title}"))

                except Movie.DoesNotExist:
                    self._safe_write(self.stderr, f"Movie not found: {title}")
                except Exception as e:
                    self._safe_write(self.stderr, f"Failed to update {title}: {str(e)}")

        # Al finalizar, muestra cuantas peliculas se actualizaron
        self._safe_write(self.stdout, self.style.SUCCESS(f"Finished updating {updated_count} movies from CSV."))
