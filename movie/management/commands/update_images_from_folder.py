from pathlib import Path
from PIL import Image
from django.conf import settings
from django.core.management.base import BaseCommand
from movie.models import Movie


class Command(BaseCommand):
    help = 'Asigna las imágenes entregadas por el profesor sin generar imágenes de pago.'

    def handle(self, *args, **options):
        folder = (Path(settings.MEDIA_ROOT) / 'movie/images').resolve()
        count = missing = 0
        for movie in Movie.objects.all():
            path = (folder / f'm_{movie.title}.png').resolve()
            if path.parent != folder or not path.is_file():
                missing += 1
                self.stdout.write(f'Pendiente: {movie.title}')
                continue
            try:
                with Image.open(path) as image:
                    image.verify()
            except (OSError, SyntaxError):
                self.stderr.write(f'Imagen inválida: {path.name}')
                missing += 1
                continue
            movie.image = f'movie/images/{path.name}'
            movie.save(update_fields=['image'])
            count += 1
        self.stdout.write(f'Imágenes asignadas: {count}. Pendientes: {missing}.')
