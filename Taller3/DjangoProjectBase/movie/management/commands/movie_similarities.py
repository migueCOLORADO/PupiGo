import os
import numpy as np
from django.core.management.base import BaseCommand
from movie.models import Movie
from openai import OpenAI
from dotenv import load_dotenv, find_dotenv

class Command(BaseCommand):
    help = "Compare two movies and optionally a prompt using OpenAI embeddings"

    def handle(self, *args, **kwargs):
        # ✅ Load OpenAI API key
        load_dotenv(find_dotenv('openAI.env'))
        print("KEY CARGADA:", bool(os.environ.get('openai_apikey')))
        client = OpenAI(
            api_key=os.environ.get('gemini_apikey'),
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
        )

        # ✅ Change these titles for any movies you want to compare
        movie1 = Movie.objects.get(title="Carmencita")
        movie2 = Movie.objects.get(title="Blacksmith Scene")

        def get_embedding(text):
            response = client.embeddings.create(
                input=[text],
                model="gemini-embedding-001",
                dimensions=1536
            )
            return np.array(response.data[0].embedding, dtype=np.float32)

        def cosine_similarity(a, b):
            return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

        # ✅ Generate embeddings of both movies
        emb1 = get_embedding(movie1.description)
        emb2 = get_embedding(movie2.description)

        # ✅ Compute similarity between movies
        similarity = cosine_similarity(emb1, emb2)
        self.stdout.write(f"\U0001F3AC Similaridad entre '{movie1.title}' y '{movie2.title}': {similarity:.4f}")

        # ✅ Optional: Compare against a prompt
        prompt = "película sobre una bailarina de flamenco"
        prompt_emb = get_embedding(prompt)

        sim_prompt_movie1 = cosine_similarity(prompt_emb, emb1)
        sim_prompt_movie2 = cosine_similarity(prompt_emb, emb2)

        self.stdout.write(f"\U0001F4DD Similitud prompt vs '{movie1.title}': {sim_prompt_movie1:.4f}")
        self.stdout.write(f"\U0001F4DD Similitud prompt vs '{movie2.title}': {sim_prompt_movie2:.4f}")