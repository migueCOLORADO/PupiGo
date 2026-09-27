from django.shortcuts import render
from .models import Movie
import matplotlib.pyplot as plt
import matplotlib
import io
import base64


def home(request):

    searchTerm = request.GET.get('searchMovie')

    if searchTerm:
        movies = Movie.objects.filter(title__icontains=searchTerm)
    else:
        movies = Movie.objects.all()

    return render(request, 'movie/home.html', {
        'title': 'Home',
        'message': 'Welcome to Movie Reviews',
        'movies': movies,
        'searchTerm': searchTerm
    })


def about(request):
    return render(request, 'movie/about.html')


def statistics_view(request):
    matplotlib.use('Agg')

    # ----- Gráfica 1: películas por año -----
    all_movies = Movie.objects.all()
    movie_counts_by_year = {}

    for movie in all_movies:
        year = movie.year if movie.year else "None"
        movie_counts_by_year[year] = movie_counts_by_year.get(year, 0) + 1

    bar_positions_year = range(len(movie_counts_by_year))

    plt.figure()
    plt.bar(bar_positions_year, movie_counts_by_year.values(), width=0.5, align='center')
    plt.title('Movies per year')
    plt.xlabel('Year')
    plt.ylabel('Number of movies')
    plt.xticks(bar_positions_year, movie_counts_by_year.keys(), rotation=90)
    plt.subplots_adjust(bottom=0.3)

    buffer = io.BytesIO()
    plt.savefig(buffer, format='png')
    buffer.seek(0)
    plt.close()
    graphic_year = base64.b64encode(buffer.getvalue()).decode('utf-8')
    buffer.close()

    # ----- Gráfica 2: películas por género (solo el primero) -----
    movie_counts_by_genre = {}

    for movie in all_movies:
        if movie.genre:
            first_genre = movie.genre.split(',')[0].strip()
        else:
            first_genre = "None"
        movie_counts_by_genre[first_genre] = movie_counts_by_genre.get(first_genre, 0) + 1

    bar_positions_genre = range(len(movie_counts_by_genre))

    plt.figure()
    plt.bar(bar_positions_genre, movie_counts_by_genre.values(), width=0.5, align='center', color='green')
    plt.title('Movies per genre (first only)')
    plt.xlabel('Genre')
    plt.ylabel('Number of movies')
    plt.xticks(bar_positions_genre, movie_counts_by_genre.keys(), rotation=90)
    plt.subplots_adjust(bottom=0.3)

    buffer2 = io.BytesIO()
    plt.savefig(buffer2, format='png')
    buffer2.seek(0)
    plt.close()
    graphic_genre = base64.b64encode(buffer2.getvalue()).decode('utf-8')
    buffer2.close()

    return render(request, 'statistics.html', {
        'graphic_year': graphic_year,
        'graphic_genre': graphic_genre
    })