import random
from django.core.management.base import BaseCommand, CommandError
from movie.models import Movie
from movie.ai import current_embedding, unpack_vector


class Command(BaseCommand):
    help = 'Muestra los primeros valores de un embedding real elegido al azar, sin llamadas API.'

    def handle(self, *args, **options):
        movies = [m for m in Movie.objects.all() if current_embedding(m)]
        if not movies:
            raise CommandError('No hay embeddings actuales. Ejecuta movie_embeddings.')
        movie = random.choice(movies)
        values = unpack_vector(movie.emb)
        self.stdout.write(f'{movie.title}\nModelo: {movie.embedding_model}\nDimensión: {len(values)}\n{values[:10]}')
