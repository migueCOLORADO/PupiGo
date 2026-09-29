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
    help = "Compara dos películas y un prompt usando embeddings de Gemini (similitud de coseno)"

    def handle(self, *args, **kwargs):
        # ✅ Configura el cliente de Gemini
        genai.configure(api_key=os.environ.get('gemini_apikey'))

        # ✅ Cambia estos títulos por las películas que quieras comparar
        #    (deben existir exactamente en la base de datos)
        movie1 = Movie.objects.get(title="A Trip to the Moon")
        movie2 = Movie.objects.get(title="Frankenstein")

        # ✅ Cambia este prompt para probar distintas búsquedas
        prompt = "película de ciencia ficción y viajes espaciales"

        def get_embedding(text):
            response = genai.embed_content(
                model="models/gemini-embedding-001",
                content=text
            )
            return np.array(response["embedding"], dtype=np.float32)

        def cosine_similarity(a, b):
            # sim(a, b) = (a · b) / (||a|| * ||b||)
            return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

        # ✅ Genera los embeddings de ambas películas
        emb1 = get_embedding(movie1.description)
        emb2 = get_embedding(movie2.description)

        # ✅ Similitud entre las dos películas
        similarity = cosine_similarity(emb1, emb2)

        self.stdout.write("=" * 60)
        self.stdout.write(f"🎬 Película 1: {movie1.title}")
        self.stdout.write(f"🎬 Película 2: {movie2.title}")
        self.stdout.write(f"📝 Prompt de búsqueda: {prompt}")
        self.stdout.write("=" * 60)

        self.stdout.write(
            f"🎬 {movie1.title} vs {movie2.title}: {similarity:.4f}"
        )

        # ✅ Similitud del prompt contra cada película
        prompt_emb = get_embedding(prompt)
        sim_prompt_movie1 = cosine_similarity(prompt_emb, emb1)
        sim_prompt_movie2 = cosine_similarity(prompt_emb, emb2)

        self.stdout.write(f"📝 Similitud prompt vs '{movie1.title}': {sim_prompt_movie1:.4f}")
        self.stdout.write(f"📝 Similitud prompt vs '{movie2.title}': {sim_prompt_movie2:.4f}")

        self.stdout.write(self.style.SUCCESS("🎯 Comparación finalizada"))
