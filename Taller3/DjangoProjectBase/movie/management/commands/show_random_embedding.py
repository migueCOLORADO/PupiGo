import random
import numpy as np
from django.core.management.base import BaseCommand
from movie.models import Movie

class Command(BaseCommand):
    help = "Muestra el embedding de una película al azar"

    def handle(self, *args, **kwargs):
        movie = random.choice(list(Movie.objects.all()))
        emb = np.frombuffer(movie.emb, dtype=np.float32)
        self.stdout.write(f"🎬 Película: {movie.title}")
        self.stdout.write(f"Dimensión del embedding: {emb.shape[0]}")
        self.stdout.write(f"Primeros 10 valores: {emb[:10]}")