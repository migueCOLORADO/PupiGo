import csv
from pathlib import Path
from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from movie.models import Movie


class Command(BaseCommand):
    help = 'Carga las descripciones proporcionadas por el profesor, sin usar la API.'

    def add_arguments(self, parser):
        parser.add_argument('--file', default=str(settings.BASE_DIR / 'updated_movie_descriptions.csv'))
        parser.add_argument('--create-missing', action='store_true', help='Añade títulos del material sin inventar año ni género.')

    @transaction.atomic
    def handle(self, *args, **options):
        path = Path(options['file'])
        if not path.is_file():
            raise CommandError('No se encontró el CSV indicado.')
        count = missing = created = 0
        with path.open(encoding='utf-8-sig', newline='') as file:
            reader = csv.DictReader(file)
            if not {'Title', 'Updated Description'} <= set(reader.fieldnames or []):
                raise CommandError('El CSV necesita Title y Updated Description.')
            for row in reader:
                title = row['Title'].strip()
                text = row['Updated Description'].strip()
                if not title or len(title) > 100 or not text:
                    raise CommandError(f'Descripción vacía: {title}')
                matches = Movie.objects.filter(title=title)
                if not matches.exists():
                    if options['create_missing']:
                        Movie.objects.create(title=title, description=text, image='movie/images/default.jpg')
                        created += 1
                        continue
                    missing += 1
                    self.stdout.write(f'Sin coincidencia: {title}')
                    continue
                count += matches.exclude(description=text).update(description=text, emb=None,
                    embedding_model='', embedding_hash='')
        self.stdout.write(self.style.SUCCESS(f'Descripciones actualizadas: {count}. Películas añadidas: {created}. Sin coincidencia: {missing}.'))
