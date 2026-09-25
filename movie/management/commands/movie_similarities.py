from django.core.management.base import BaseCommand, CommandError
from movie.models import Movie
from movie.ai import AIError, get_embedding, unpack_vector, cosine_similarity, current_embedding


class Command(BaseCommand):
    help = 'Compara dos películas y un prompt con similitud de coseno.'

    def add_arguments(self, parser):
        parser.add_argument('movie1', type=int)
        parser.add_argument('movie2', type=int)
        parser.add_argument('prompt')

    def handle(self, *args, **options):
        try:
            a = Movie.objects.get(pk=options['movie1'])
            b = Movie.objects.get(pk=options['movie2'])
        except Movie.DoesNotExist:
            raise CommandError('Uno de los identificadores no corresponde a una película.') from None
        if not all(current_embedding(m) for m in [a,b]):
            raise CommandError('Genera primero los embeddings de ambas películas.')
        try:
            va, vb = unpack_vector(a.emb), unpack_vector(b.emb)
            query = get_embedding(options['prompt'])
            self.stdout.write(f'{a.title} / {b.title}: {cosine_similarity(va,vb):.4f}')
            self.stdout.write(f'Prompt: {options["prompt"]}')
            self.stdout.write(f'{a.title}: {cosine_similarity(query,va):.4f}')
            self.stdout.write(f'{b.title}: {cosine_similarity(query,vb):.4f}')
        except AIError as exc:
            raise CommandError(str(exc)) from None
