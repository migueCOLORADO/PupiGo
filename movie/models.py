from django.db import models


class Movie(models.Model):
    title = models.CharField(max_length=255)
    description = models.CharField(max_length=1000)
    image = models.ImageField(upload_to='movie/images/')
    url = models.URLField(blank=True)

    def __str__(self):
        return self.title
