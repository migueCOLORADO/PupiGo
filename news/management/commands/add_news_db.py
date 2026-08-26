import csv
from datetime import date
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand

from news.models import News

# Mapa de meses en inglés -> número. Se usa para interpretar el formato
# "%B %d, %Y" (por ejemplo "December 31, 2017") sin depender del locale del
# sistema operativo, que en Windows suele estar en español.
MONTHS = {
    "January": 1, "February": 2, "March": 3, "April": 4,
    "May": 5, "June": 6, "July": 7, "August": 8,
    "September": 9, "October": 10, "November": 11, "December": 12,
}


def parse_date(value):
    # Convierte "December 31, 2017" en un objeto date(2017, 12, 31).
    value = value.strip().replace(",", "")
    month_name, day, year = value.split()
    return date(int(year), MONTHS[month_name], int(day))


class Command(BaseCommand):
    help = "Carga 5 noticias desde Fake.csv a la base de datos."

    def handle(self, *args, **options):
        csv_path = Path(settings.BASE_DIR) / "Fake.csv"
        if not csv_path.exists():
            self.stderr.write(f"No se encontró el archivo: {csv_path}")
            return

        # Evitamos duplicados si el comando se corre más de una vez.
        News.objects.all().delete()

        created = 0
        with open(csv_path, newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                if created >= 5:  # solo se piden 5 noticias
                    break
                News.objects.create(
                    headline=(row.get("title") or "").strip()[:200],
                    body=(row.get("text") or "").strip(),
                    date=parse_date(row.get("date") or ""),
                )
                created += 1

        self.stdout.write(
            self.style.SUCCESS(f"Se cargaron {created} noticias en la base de datos.")
        )
