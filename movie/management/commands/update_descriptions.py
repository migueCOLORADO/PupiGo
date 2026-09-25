from django.core.management.base import BaseCommand, CommandError
from movie.models import Movie
from movie.ai import AIError, get_description


class Command(BaseCommand):
    help = 'Genera con Gemini la descripción de UNA película, como indica el taller.'

    def add_arguments(self, parser):
        parser.add_argument('--movie-id', type=int)

    def handle(self, *args, **options):
        movies = Movie.objects.order_by('pk')
        if options['movie_id'] is not None:
            movies = movies.filter(pk=options['movie_id'])
        movie = movies.first()
        if movie is None:
            raise CommandError('No se encontró la película.')
        try:
            movie.description = get_description(movie)
        except AIError as exc:
            raise CommandError(str(exc)) from None
        movie.emb = None
        movie.embedding_model = movie.embedding_hash = ''
        movie.save(update_fields=['description', 'emb', 'embedding_model', 'embedding_hash'])
        self.stdout.write(self.style.SUCCESS(f'Descripción actualizada: {movie.title}. Solo una película.'))
