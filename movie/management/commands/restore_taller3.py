"""Restaura el catálogo de demostración únicamente en una base nueva."""
import shutil
from pathlib import Path
from django.conf import settings
from django.core.management import call_command
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from movie.models import Movie
from news.models import News


class Command(BaseCommand):
    help = 'Carga los datos de demostración y sus imágenes sin consumir API. Requiere base vacía.'

    def handle(self, *args, **options):
        if Movie.objects.exists() or News.objects.exists():
            raise CommandError('Ya existen películas o noticias. No se sobrescribe la base actual.')
        assets = settings.BASE_DIR / 'demo_data' / 'media'
        fixture = settings.BASE_DIR / 'demo_data' / 'catalogo.json'
        if not fixture.is_file():
            raise CommandError('Falta demo_data/catalogo.json.')
        for source in assets.rglob('*'):
            if source.is_file():
                destination = Path(settings.MEDIA_ROOT) / source.relative_to(assets)
                destination.parent.mkdir(parents=True, exist_ok=True)
                if not destination.exists():
                    shutil.copy2(source, destination)
        with transaction.atomic():
            call_command('loaddata', str(fixture), verbosity=0)
        self.stdout.write(self.style.SUCCESS(f'Catálogo restaurado: {Movie.objects.count()} películas. Sin llamadas API.'))
