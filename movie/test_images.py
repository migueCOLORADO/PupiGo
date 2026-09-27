import io
import tempfile
from pathlib import Path
from unittest.mock import patch
from PIL import Image
from django.test import TestCase, override_settings
from django.core.management import call_command
from django.core.management.base import CommandError
from movie.models import Movie


class ImageGenerationTests(TestCase):
    @patch('movie.management.commands.update_images.config', return_value={})
    @patch('movie.management.commands.update_images.InferenceClient')
    def test_missing_token_never_calls_provider(self, api, env):
        with self.assertRaises(CommandError):
            call_command('update_images', stdout=io.StringIO())
        api.assert_not_called()

    @patch('movie.management.commands.update_images.config', return_value={'HF_TOKEN':'hf_test','HF_FREE_CREDITS_ONLY_CONFIRMED':'true'})
    @patch('movie.management.commands.update_images.InferenceClient')
    def test_one_image_saved_and_previous_file_preserved(self, api, env):
        api.return_value.__enter__.return_value.text_to_image.return_value = Image.new('RGB',(16,16))
        movie = Movie.objects.create(title='Prueba', description='Amistad', image='anterior.png')
        other = Movie.objects.create(title='Otra', description='Otro tema', image='otra.png')
        with tempfile.TemporaryDirectory() as tmp, override_settings(BASE_DIR=Path(tmp), MEDIA_ROOT=tmp):
            old = Path(tmp)/'anterior.png'
            old.write_bytes(b'original')
            call_command('update_images', movie_id=movie.pk, stdout=io.StringIO())
            movie.refresh_from_db(); other.refresh_from_db()
            self.assertTrue((Path(tmp)/movie.image.name).is_file())
            self.assertEqual(old.read_bytes(), b'original')
            self.assertEqual(other.image.name, 'otra.png')
            self.assertEqual(len(list((Path(tmp)/'evidencias/taller3').glob('*.json'))),1)
        api.return_value.__enter__.return_value.text_to_image.assert_called_once()

    @patch('movie.management.commands.update_images.config', return_value={'HF_TOKEN':'hf_test','HF_FREE_CREDITS_ONLY_CONFIRMED':'true'})
    @patch('movie.management.commands.update_images.InferenceClient')
    def test_api_error_does_not_replace_image_or_expose_exception(self, api, env):
        api.return_value.__enter__.return_value.text_to_image.side_effect = RuntimeError('private-token')
        movie = Movie.objects.create(title='Prueba', description='Amistad', image='anterior.png')
        with self.assertRaises(CommandError) as error:
            call_command('update_images', movie_id=movie.pk, stdout=io.StringIO())
        self.assertNotIn('private-token', str(error.exception))
        movie.refresh_from_db()
        self.assertEqual(movie.image.name, 'anterior.png')
