import os
import numpy as np
from django.core.management.base import BaseCommand
from movie.models import Movie
import google.generativeai as genai
from dotenv import load_dotenv

# Ruta absoluta a geminiAI.env (un nivel arriba de DjangoProjectBase)
env_path = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))),
    'geminiAI.env'
)
load_dotenv(env_path)


class Command(BaseCommand):
    help = "Genera y guarda embeddings (Gemini) para las películas en la base de datos"

    def handle(self, *args, **kwargs):
        #  Configura el cliente de Gemini
        genai.configure(api_key=os.environ.get('gemini_apikey'))

        #  Limita a 10 películas para no gastar tokens
        movies = Movie.objects.all()[:10]
        self.stdout.write(f"Found {movies.count()} movies in the database")

        def get_embedding(text):
            response = genai.embed_content(
                model="models/gemini-embedding-001",
                content=text
            )
            return np.array(response["embedding"], dtype=np.float32)

        #  Genera y almacena el embedding de cada película
        for movie in movies:
            try:
                emb = get_embedding(movie.description)
                movie.emb = emb.tobytes()  # guarda el vector como binario
                movie.save()
                self.stdout.write(self.style.SUCCESS(f"👌 Embedding stored for: {movie.title}"))
            except Exception as e:
                self.stderr.write(f"❌ Failed to generate embedding for {movie.title}: {e}")

        self.stdout.write(self.style.SUCCESS("🌟 Finished generating embeddings for all movies"))
