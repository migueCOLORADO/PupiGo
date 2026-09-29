import os
from google import genai
from django.core.management.base import BaseCommand
from movie.models import Movie
from dotenv import load_dotenv

class Command(BaseCommand):
    help = "Update movie descriptions using Gemini API"

    def handle(self, *args, **kwargs):
        # ✅ Load environment variables from the .env file
        load_dotenv('openAI.env')

        # ✅ Initialize the Gemini client with the API key
        client = genai.Client(api_key=os.environ.get('gemini_apikey'))

        # ✅ Helper function to send prompt and get completion from Gemini
        def get_completion(prompt):
            response = client.models.generate_content(
                model="gemini-3.8-flash",
                contents=prompt,
            )
            return response.text.strip()

        # ✅ Instruction to guide the AI response (clear, concise, with genre info)
        instruction = (
            "Vas a actuar como un aficionado del cine que sabe describir de forma clara, "
            "concisa y precisa cualquier película en menos de 200 palabras. La descripción "
            "debe incluir el género de la película y cualquier información adicional que sirva "
            "para crear un sistema de recomendación."
        )

        # ✅ Fetch all movies from the database
        movies = Movie.objects.all()
        self.stdout.write(f"Found {movies.count()} movies")

        # ✅ Process each movie
        for movie in movies:
            self.stdout.write(f"Processing: {movie.title}")
            try:
                prompt = (
                    f"{instruction} "
                    f"Vas a actualizar la descripción '{movie.description}' de la película '{movie.title}'."
                )

                print(f"Title: {movie.title}")
                print(f"Original Description: {movie.description}")

                updated_description = get_completion(prompt)

                print(f"Updated Description: {updated_description}")

                movie.description = updated_description
                movie.save()

                self.stdout.write(self.style.SUCCESS(f"Updated: {movie.title}"))

            except Exception as e:
                self.stderr.write(f"Failed for {movie.title}: {str(e)}")

            # ✅ NO quitar el break - solo procesamos 1 película
            break