# Talleres PI — Samuel Montoya

Rama única donde se van subiendo **todos los talleres** de Proyecto Integrador (ST0251, Frontend y BD) sobre el proyecto Django `moviereviewsproject`.

El **código es un único proyecto que evoluciona** taller a taller (cada taller amplía el anterior), por eso vive en una sola rama. Las **evidencias y documentos** de cada entrega sí se separan en carpetas.

## Estructura

```
moviereviewsproject/
├── movie/            # app principal (películas, cards, gráficas)
├── news/             # app de noticias (Taller 2)
├── moviereviews/     # settings, urls, base.html, static
├── evidencias/
│   ├── taller1/      # capturas de la entrega 1
│   └── taller2/      # capturas de la entrega 2
├── movies_initial.csv / Fake.csv / default.jpg   # datasets e imagen semilla
├── requirements.txt
└── TALLERES.md       # este archivo
```

> Para documentos por entrega (PDF del taller, enunciado, etc.) usar la misma
> convención: `docs/taller1/`, `docs/taller2/`, … a medida que se agreguen.

## Mapa de entregas → commits

| Entrega | Contenido | Commits clave |
|---------|-----------|---------------|
| **Taller 1** | Proyecto Django, app `movie`, `home.html`, `about.html`, búsqueda, media | `agregar proyecto Django a mi rama` → `visualizacion de peliculas con estilo` |
| **Taller 2** | Cards Bootstrap, app `news`, BD películas/noticias, `base.html` + navbar/footer, gráficas matplotlib | `inclusion de Cards` · `creacion de app news` · `llenado de la base de datos de peliculas` · `llenado de la base de datos de noticias` · `navbar y footer` · `generacion de graficas` |

## Cómo correr el proyecto

```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py add_movies_db   # carga películas
python manage.py add_news_db     # carga noticias
python manage.py runserver
```

Luego abrir en el navegador:

- Películas (home): http://localhost:8000/
- Noticias: http://localhost:8000/news/
- Estadísticas / gráficas: http://localhost:8000/statistics/
- About: http://localhost:8000/about/
