from django.shortcuts import render
from django.http import HttpResponse
from .models import Movie

import matplotlib.pyplot as plt
import matplotlib
import io
import urllib, base64

# Create your views here.
#def home(request):
    #return HttpResponse("Hello, welcome to home page")
    #return render(request, 'home.html')
    #return render(request, 'home.html', {'name': 'Daniel Giraldo'})
    #searchTerm = request.GET.get('searchMovie')
    #movies = Movie.objects.all()
    #return render(request, 'home.html', {'searchTerm': searchTerm, 'movies': movies, 'name': 'Daniel Giraldo'})

def home(request):
    searchTerm = request.GET.get('searchMovie')

    if searchTerm:
        movies = Movie.objects.filter(title__icontains=searchTerm)
    else:
        movies = Movie.objects.all()

    return render(request, 'home.html', {
        'searchTerm': searchTerm,
        'movies': movies,
        'name': 'Daniel Giraldo'
    })

def about(request):
    return render(request, 'about.html')


def statistics_view(request):
    matplotlib.use('Agg')
    # Obtener todas las peliculas
    all_movies = Movie.objects.all()

    # Crean un diccionario para almacenar la cantidad de películas por género
    movie_counts_by_genre = {}

    # Filtrar las películas por género y contar la cantidad de películas por género
    for movie in all_movies:
        # Obtener el primer género (asumiendo que genre es un string)
        if movie.genre:
            # Si hay múltiples géneros separados por coma, tomar el primero
            if ',' in movie.genre:
                first_genre = movie.genre.split(',')[0].strip()
            else:
                first_genre = movie.genre.strip()
        else:
            first_genre = "Sin género"

        # Contar películas por género
        if first_genre in movie_counts_by_genre:
            movie_counts_by_genre[first_genre] += 1
        else:
            movie_counts_by_genre[first_genre] = 1

    # Ancho de las barras
    bar_width = 0.5
    # Posiciones de las barras
    bar_positions = range(len(movie_counts_by_genre))

    # Crear la gráfica de barras
    plt.bar(bar_positions, movie_counts_by_genre.values(), width=bar_width, align='center')

    # Personalizar la gráfica
    plt.title('Movies per Genre')
    plt.xlabel('Genre')
    plt.ylabel('Number of movies')
    plt.xticks(bar_positions, movie_counts_by_genre.keys(), rotation=45, ha='right')

    # Ajustar el espaciado para que se vean bien las etiquetas
    plt.subplots_adjust(bottom=0.3)

    # Guardar la gráfica en un objeto BytesIO
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png')
    buffer.seek(0)
    plt.close()

    # Convertir la gráfica a base64
    image_png = buffer.getvalue()
    buffer.close()
    graphic = base64.b64encode(image_png)
    graphic = graphic.decode('utf-8')

    # Renderizar la plantilla statistics.html con la gráfica
    return render(request, 'statistics.html', {'graphic': graphic})


def signup(request):
    email = request.GET.get('email')
    return render(request, 'signup.html', {'email':email})