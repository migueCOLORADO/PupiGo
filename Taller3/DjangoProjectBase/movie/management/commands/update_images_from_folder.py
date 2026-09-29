import os
from django.core.management.base import BaseCommand
from movie.models import Movie


class Command(BaseCommand):
    help = "Assign images from media/movie/images/ to each movie"

    def handle(self, *args, **kwargs):
        images_folder = 'media/movie/images/'

        if not os.path.isdir(images_folder):
            self.stderr.write(f"Folder '{images_folder}' not found.")
            return

        updated_count = 0
        missing = []

        for movie in Movie.objects.all():
            filename = f"m_{movie.title}.png"

            if os.path.exists(os.path.join(images_folder, filename)):
                movie.image = os.path.join('movie/images', filename)
                movie.save()
                updated_count += 1
                self.stdout.write(self.style.SUCCESS(f"Image updated: {movie.title}"))
            else:
                missing.append(movie.title)

        self.stdout.write(self.style.SUCCESS(f"Finished: {updated_count} images assigned."))
        if missing:
            self.stderr.write(f"No image found for {len(missing)} movies: {missing}")