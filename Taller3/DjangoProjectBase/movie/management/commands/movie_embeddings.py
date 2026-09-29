import os
import time
import numpy as np
from django.core.management.base import BaseCommand
from movie.models import Movie
from openai import OpenAI
from dotenv import load_dotenv, find_dotenv

class Command(BaseCommand):
    help = "Generate and store embeddings for all movies in the database"

    def handle(self, *args, **kwargs):
        load_dotenv(find_dotenv('openAI.env'))
        api_key = os.environ.get('gemini_apikey') or os.environ.get('openai_apikey')
        client = OpenAI(
            api_key=api_key,
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
        )

        movies = Movie.objects.all()
        self.stdout.write(f"Found {movies.count()} movies in the database")

        def get_embedding(text):
            response = client.embeddings.create(
                input=[text],
                model="gemini-embedding-001",
                dimensions=1536
            )
            return np.array(response.data[0].embedding, dtype=np.float32)

        for movie in movies:
            try:
                emb = get_embedding(movie.description)
                movie.emb = emb.tobytes()
                movie.save()
                self.stdout.write(self.style.SUCCESS(f"✅ Embedding stored for: {movie.title}"))
                time.sleep(0.7)  # evita el límite de peticiones del plan gratis
            except Exception as e:
                self.stderr.write(f"❌ Failed to generate embedding for {movie.title}: {e}")

        self.stdout.write(self.style.SUCCESS("🎯 Finished generating embeddings for all movies"))