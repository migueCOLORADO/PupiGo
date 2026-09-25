from django.db import models


class Movie(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    emb = models.BinaryField(null=True, blank=True)
    embedding_model = models.CharField(max_length=100, blank=True, default="")
    embedding_hash = models.CharField(max_length=64, blank=True, default="")
    image = models.ImageField(upload_to="movie/images/")
    url = models.URLField(blank=True)
    genre = models.CharField(max_length=100, blank=True, default="")
    year = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return self.title
