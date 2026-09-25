import time
from django.core.management.base import BaseCommand, CommandError
from movie.models import Movie
from movie.ai import AIError, current_embedding, get_embedding, pack_vector, embedding_model, fingerprint


class Command(BaseCommand):
    help = 'Genera embeddings faltantes; permite reanudar tras agotar la cuota gratuita.'

    def add_arguments(self, parser):
        parser.add_argument('--limit', type=int, default=5)
        parser.add_argument('--delay', type=float, default=5)

    def handle(self, *args, **options):
        if options['limit'] < 1 or options['delay'] < 0:
            raise CommandError('limit debe ser positivo y delay no negativo.')
        updated = 0
        for movie in Movie.objects.order_by('pk'):
            if current_embedding(movie):
                continue
            if updated:
                time.sleep(options['delay'])
            try:
                movie.emb = pack_vector(get_embedding(movie.description))
            except AIError as exc:
                raise CommandError(f'{exc} Guardados en esta ejecución: {updated}. Puedes reanudar.') from None
            movie.embedding_model = embedding_model()
            movie.embedding_hash = fingerprint(movie.description)
            movie.save(update_fields=['emb', 'embedding_model', 'embedding_hash'])
            updated += 1
            self.stdout.write(f'Embedding guardado: {movie.title}')
            if updated >= options['limit']:
                break
        self.stdout.write(self.style.SUCCESS(f'Embeddings nuevos: {updated}.'))
