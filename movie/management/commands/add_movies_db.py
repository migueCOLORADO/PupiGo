import csv
import shutil
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand

from movie.models import Movie


class Command(BaseCommand):
    help = "Carga las películas desde movies_initial.csv a la base de datos."

    def handle(self, *args, **options):
        # Rutas de trabajo -------------------------------------------------
        csv_path = Path(settings.BASE_DIR) / "movies_initial.csv"
        if not csv_path.exists():
            self.stderr.write(f"No se encontró el archivo: {csv_path}")
            return

        # La imagen por defecto vive en el repo (default.jpg) y se copia a
        # MEDIA_ROOT/movie/images/ para que el ImageField la encuentre.
        images_dir = Path(settings.MEDIA_ROOT) / "movie" / "images"
        images_dir.mkdir(parents=True, exist_ok=True)

        source_default = Path(settings.BASE_DIR) / "default.jpg"
        default_rel = "movie/images/default.jpg"
        if source_default.exists():
            shutil.copy(source_default, images_dir / "default.jpg")

        # Evitamos duplicados si el comando se corre más de una vez.
        Movie.objects.all().delete()

        created = 0
        with open(csv_path, newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                year_raw = (row.get("year") or "").strip()
                try:
                    year = int(year_raw) if year_raw else None
                except ValueError:
                    year = None

                Movie.objects.create(
                    title=(row.get("title") or "").strip()[:100],
                    description=(row.get("description") or "").strip()[:250],
                    genre=(row.get("genre") or "").strip()[:100],
                    year=year,
                    image=default_rel,
                    url="",
                )
                created += 1

        self.stdout.write(
            self.style.SUCCESS(f"Se cargaron {created} películas en la base de datos.")
        )
