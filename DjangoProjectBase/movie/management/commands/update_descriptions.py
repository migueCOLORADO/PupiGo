from openai import OpenAI
import os
from dotenv import load_dotenv
from django.core.management.base import BaseCommand
from movie.models import Movie

# Ruta absoluta al archivo openAI.env (está un nivel por encima de DjangoProjectBase)
env_path = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))),
    'openAI.env'
)
load_dotenv(env_path)

# Inicializa el cliente de OpenAI leyendo la variable de la apikey del archivo env
client = OpenAI(api_key=os.environ.get('openia_apikey'))

def get_completion(prompt, model="gpt-3.5-turbo"):
    messages = [{"role": "user", "content": prompt}]
    response = client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=0
    )
    return response.choices[0].message.content.strip()

class Command(BaseCommand):
    help = "Actualiza las descripciones de las películas usando OpenAI"

    def handle(self, *args, **options):
        movies = Movie.objects.all()
        instruction = "Mejora la descripción de la película manteniendo la información original."

        for movie in movies:
            prompt = f"{instruction} Actualiza la descripción '{movie.description}' de la película '{movie.title}'"
            response = get_completion(prompt)
            movie.description = response
            movie.save()
            self.stdout.write(self.style.SUCCESS(f"Actualizada: {movie.title}"))
            break  # quita el break para procesar todas las peliculas
