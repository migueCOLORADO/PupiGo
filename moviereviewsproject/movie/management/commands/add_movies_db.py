import os
import pandas as pd
from django.core.management.base import BaseCommand
from movie.models import Movie


class Command(BaseCommand):
    help = 'Carga películas desde el archivo IMDbMovies.csv'

    def handle(self, *args, **options):
        csv_path = os.path.join(os.path.dirname(__file__), 'IMDbMovies.csv')
        df = pd.read_csv(csv_path)

        # Descartamos filas sin los datos que necesitamos
        df = df.dropna(subset=['Title', 'Summary', 'Main Genres', 'Release Year'])

        # Tomamos las primeras 100 películas válidas
        df = df.head(100)

        count = 0
        for _, row in df.iterrows():
            Movie.objects.create(
                title=row['Title'][:255],
                description=row['Summary'],
                genre=row['Main Genres'],
                year=int(row['Release Year']),
                image='movie/images/default.jpg',
                url=''
            )
            count += 1

        self.stdout.write(self.style.SUCCESS(f'{count} películas agregadas correctamente'))