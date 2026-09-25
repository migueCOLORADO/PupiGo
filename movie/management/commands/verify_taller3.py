import csv
import json
from pathlib import Path
from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from movie.models import Movie
from movie.ai import current_embedding


class Command(BaseCommand):
    help = 'Verifica catálogo, descripciones y archivos sin consultar APIs.'

    def handle(self, *args, **options):
        movies = list(Movie.objects.all())
        with (settings.BASE_DIR / 'updated_movie_descriptions.csv').open(encoding='utf-8-sig', newline='') as source:
            rows = list(csv.DictReader(source))
        matches = sum(any(m.title == r['Title'].strip() and m.description == r['Updated Description'].strip()
                          for m in movies) for r in rows)
        missing_files = [m.title for m in movies if not (Path(settings.MEDIA_ROOT) / m.image.name).is_file()]
        ready = sum(current_embedding(m) for m in movies)
        report = {'peliculas': len(movies), 'filas_csv': len(rows), 'descripciones_csv_coincidentes': matches,
                  'embeddings_actuales': ready, 'imagenes_especificas': sum(m.image.name != 'movie/images/default.jpg' for m in movies),
                  'archivos_imagen_ausentes': missing_files,
                  'pendiente_externo': 'Importación completa de la carpeta de imágenes del profesor: enlace inaccesible.'}
        self.stdout.write(json.dumps(report, ensure_ascii=False, indent=2))
        if matches != len(rows) or ready != len(movies) or missing_files:
            raise CommandError('Hay descripciones, embeddings o archivos pendientes. Consulta el reporte.')
