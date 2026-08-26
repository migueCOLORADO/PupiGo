from django.db import models


class News(models.Model):
    # Cada noticia tiene un titular, un cuerpo y una fecha de publicación.
    headline = models.CharField(max_length=200)
    body = models.TextField()
    date = models.DateField()

    def __str__(self):
        return self.headline
