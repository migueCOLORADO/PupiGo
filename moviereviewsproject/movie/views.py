from django.shortcuts import render
from .models import Movie


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