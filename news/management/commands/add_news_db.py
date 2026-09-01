import csv
import os
from datetime import datetime
from django.core.management.base import BaseCommand
from news.models import News


class Command(BaseCommand):
    help = 'Load 5 news from Fake.csv into the News model'

    def handle(self, *args, **kwargs):
        csv_file_path = 'news/management/commands/Fake.csv'

        created_count = 0
        updated_count = 0
        error_count = 0

        if not os.path.exists(csv_file_path):
            self.stdout.write(
                self.style.ERROR(f'File not found: {csv_file_path}')
            )
            return

        try:
            with open(csv_file_path, mode='r', encoding='utf-8') as file:
                reader = csv.DictReader(file)

                cont = 0
                max_news = 5

                for row in reader:
                    if cont >= max_news:
                        break

                    try:
                        # Procesamiento de la fecha
                        date_str = row.get('date', '').strip()

                        if date_str:
                            date_obj = datetime.strptime(date_str, '%B %d, %Y').date()
                        else:
                            date_obj = None

                        # Mapeo: title -> headline, text -> body, date -> date
                        obj, created = News.objects.update_or_create(
                            headline=row['title'],
                            defaults={
                                'body': row['text'],
                                'date': date_obj,
                            }
                        )

                        if created:
                            created_count += 1
                        else:
                            updated_count += 1

                        cont += 1

                    except Exception as e:
                        error_count += 1
                        self.stdout.write(
                            self.style.WARNING(f'Error processing row {cont + 1}: {e}')
                        )
                        continue

            self.stdout.write(
                self.style.SUCCESS(
                    f'Import completed. '
                    f'Created: {created_count}, '
                    f'Updated: {updated_count}, '
                    f'Errors: {error_count}'
                )
            )

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Unexpected error: {e}')
            )