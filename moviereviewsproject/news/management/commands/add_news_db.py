import os
from datetime import datetime
import pandas as pd
from django.core.management.base import BaseCommand
from news.models import News


class Command(BaseCommand):
    help = 'Carga 5 noticias desde el archivo Fake.csv'

    def handle(self, *args, **options):
        csv_path = os.path.join(os.path.dirname(__file__), 'Fake.csv')
        df = pd.read_csv(csv_path)

        count = 0
        for _, row in df.iterrows():
            if count >= 5:
                break

            try:
                date_value = datetime.strptime(
                    row['date'],
                    '%B %d, %Y'
                ).date()
            except (ValueError, TypeError):
                # Saltamos filas con fecha en formato distinto o corrupta
                continue

            News.objects.create(
                headline=row['title'][:200],
                body=row['text'],
                date=date_value
            )
            count += 1

        self.stdout.write(self.style.SUCCESS(f'{count} noticias agregadas correctamente'))