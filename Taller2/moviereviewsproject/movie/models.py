from django.db import models

class Movie(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    genre = models.CharField(max_length=255, blank=True)
    year = models.IntegerField(blank=True, null=True)
    image = models.ImageField(upload_to='movie/images/')
    url = models.URLField(blank=True)

    def __str__(self):
        return self.title