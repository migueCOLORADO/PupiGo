import base64
import io
from collections import Counter

import matplotlib
matplotlib.use("Agg")  # backend sin ventana, apto para servidor
import matplotlib.pyplot as plt

from django.shortcuts import render
from .models import Movie


def home(request):
    searchTerm = request.GET.get("searchMovie")

    if searchTerm:
        movies = Movie.objects.filter(title__icontains=searchTerm)
    else:
        movies = Movie.objects.all()

    return render(
        request,
        "home.html",
        {
            "searchTerm": searchTerm,
            "movies": movies,
        },
    )


def about(request):
    return render(request, "about.html")


def _plot_to_base64(fig):
    # Convierte una figura de matplotlib en una imagen PNG codificada en base64,
    # lista para incrustarse directamente en el HTML con <img src="data:...">.
    buffer = io.BytesIO()
    fig.savefig(buffer, format="png", bbox_inches="tight")
    buffer.seek(0)
    image_png = buffer.getvalue()
    buffer.close()
    plt.close(fig)
    return base64.b64encode(image_png).decode("utf-8")


def statistics_view(request):
    movies = Movie.objects.all()

    # ---- Gráfica 1: películas por año --------------------------------------
    years = [m.year for m in movies if m.year is not None]
    year_counts = dict(sorted(Counter(years).items()))

    fig1, ax1 = plt.subplots(figsize=(8, 4))
    ax1.bar(
        [str(y) for y in year_counts.keys()],
        list(year_counts.values()),
        color="#0d6efd",
    )
    ax1.set_title("Películas por año")
    ax1.set_xlabel("Año")
    ax1.set_ylabel("Cantidad")
    plt.setp(ax1.get_xticklabels(), rotation=90)
    graphic_year = _plot_to_base64(fig1)

    # ---- Gráfica 2: películas por género (solo el primer género) -----------
    genres = []
    for m in movies:
        if m.genre:
            # "Action, Crime" -> "Action" (solo el primer género)
            first_genre = m.genre.split(",")[0].strip()
            genres.append(first_genre)
    genre_counts = dict(sorted(Counter(genres).items()))

    fig2, ax2 = plt.subplots(figsize=(8, 4))
    ax2.bar(
        list(genre_counts.keys()),
        list(genre_counts.values()),
        color="#198754",
    )
    ax2.set_title("Películas por género")
    ax2.set_xlabel("Género")
    ax2.set_ylabel("Cantidad")
    plt.setp(ax2.get_xticklabels(), rotation=90)
    graphic_genre = _plot_to_base64(fig2)

    return render(
        request,
        "statistics.html",
        {
            "graphic_year": graphic_year,
            "graphic_genre": graphic_genre,
        },
    )
