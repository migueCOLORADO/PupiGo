from django.shortcuts import render
from .models import News


def news(request):
    # Se muestran las noticias de la más reciente a la más antigua.
    news = News.objects.order_by('-date')
    return render(request, 'news.html', {'news': news})
