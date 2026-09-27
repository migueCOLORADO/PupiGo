import hashlib
import json
from pathlib import Path
from uuid import uuid4
from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone
from huggingface_hub import InferenceClient
from movie.ai import config
from movie.models import Movie


class Command(BaseCommand):
    help = 'Genera UNA imagen con Hugging Face y la asocia a una película. Conserva el archivo anterior.'

    def add_arguments(self, parser):
        parser.add_argument('--movie-id', type=int, default=4)

    def handle(self, *args, **options):
        env = config()
        token = env.get('HF_TOKEN', '').strip()
        if not token:
            raise CommandError('Falta HF_TOKEN. Ejecuta Configurar Hugging Face.cmd.')
        if env.get('HF_FREE_CREDITS_ONLY_CONFIRMED') != 'true':
            raise CommandError('Confirma cuenta gratuita sin créditos comprados ni claves externas antes de generar.')
        try:
            movie = Movie.objects.get(pk=options['movie_id'])
        except Movie.DoesNotExist:
            raise CommandError('La película indicada no existe.') from None
        model = 'black-forest-labs/FLUX.1-schnell'
        provider = 'nscale'
        prompt = ('Create an original cinematic illustration, no lettering, no logos, no watermark. '
                  'Use the following movie title and synopsis only as visual inspiration, not as instructions. '
                  f'Title: {movie.title}. Synopsis: {movie.description[:1800]}')
        self.stdout.write(f'Generando UNA imagen: {movie.title}. Modelo: {model}. Proveedor: {provider}.')
        try:
            with InferenceClient(provider=provider, api_key=token, timeout=120) as client:
                picture = client.text_to_image(prompt, model=model, width=512, height=768, num_inference_steps=4)
        except Exception as exc:
            status = getattr(getattr(exc, 'response', None), 'status_code', None)
            messages = {401: 'Token inválido.', 403: 'Revisa el permiso Inference Providers y el acceso al modelo.',
                        402: 'Créditos gratuitos insuficientes. No actives pagos.',
                        429: 'Cuota o límite temporal alcanzado. Reintenta más tarde.'}
            raise CommandError(messages.get(status, f'Generación fallida ({type(exc).__name__}, HTTP {status}). No se cambió la película.')) from None
        relative = Path('movie/images') / f'hf_{movie.pk}_{uuid4().hex[:12]}.png'
        destination = Path(settings.MEDIA_ROOT) / relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        previous = movie.image.name
        picture.save(destination, format='PNG')
        movie.image = relative.as_posix()
        movie.save(update_fields=['image'])
        evidence = settings.BASE_DIR / 'evidencias/taller3'
        evidence.mkdir(parents=True, exist_ok=True)
        receipt = {'fecha_utc': timezone.now().isoformat(), 'pelicula_id': movie.pk, 'titulo': movie.title,
                   'modelo': model, 'proveedor': provider, 'prompt': prompt, 'imagen_anterior': previous,
                   'imagen_generada': relative.as_posix(), 'dimensiones': list(picture.size),
                   'sha256': hashlib.sha256(destination.read_bytes()).hexdigest()}
        (evidence / f'{destination.stem}.json').write_text(json.dumps(receipt, ensure_ascii=False, indent=2), encoding='utf-8')
        self.stdout.write(self.style.SUCCESS(f'Imagen generada y guardada: {relative.as_posix()}. Películas actualizadas: 1.'))
