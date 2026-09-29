import os
from openai import OpenAI
from dotenv import load_dotenv
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from movie.models import Movie

import requests


def load_api_key():
    """Carga la API key desde openAI.env (un nivel arriba de BASE_DIR) o del entorno."""
    env_path = os.path.join(os.path.dirname(settings.BASE_DIR), "openAI.env")
    load_dotenv(env_path)
    return os.environ.get("openia_apikey") or os.environ.get("OPENAI_API_KEY")


class Command(BaseCommand):
    help = "Genera imagenes para las peliculas usando OpenAI y las guarda en la base de datos"

    def handle(self, *args, **options):
        api_key = load_api_key()
        if not api_key:
            self.stderr.write("No se encontro la API key. Revisa openAI.env (openia_apikey=...).")
            return

        # Cliente creado dentro de handle para asegurar que la key ya esta cargada
        client = OpenAI(api_key=api_key)

        movies = Movie.objects.all()
        self.stdout.write(f"Found {movies.count()} movies")

        updated_count = 0
        for movie in movies:
            try:
                prompt = f"Movie poster of '{movie.title}': {movie.description[:500]}"

                # Genera la imagen con el modelo de imagenes de OpenAI
                response = client.images.generate(
                    model="dall-e-3",
                    prompt=prompt,
                    size="1024x1024",
                    n=1,
                )
                image_url = response.data[0].url

                # Descarga la imagen generada
                image_response = requests.get(image_url, timeout=60)
                image_response.raise_for_status()

                # Guarda la imagen en el campo ImageField de la pelicula
                file_name = f"{movie.title}.png"
                movie.image.save(file_name, ContentFile(image_response.content), save=True)
                updated_count += 1

                self.stdout.write(self.style.SUCCESS(f"Updated image: {movie.title}"))

            except Exception as e:
                self.stderr.write(f"Failed for {movie.title}: {str(e)}")

        self.stdout.write(self.style.SUCCESS(f"Finished updating images for {updated_count} movies."))
