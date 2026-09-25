import csv
import io
import os
import tempfile
from pathlib import Path
from unittest.mock import patch
from django.test import TestCase
from django.core.management import call_command
from django.core.management.base import CommandError
from movie.models import Movie
from movie import ai


class AITests(TestCase):
    def movie(self, title='Espacio', text='Viaje espacial', vector=None):
        return Movie.objects.create(title=title, description=text,
            emb=ai.pack_vector(vector) if vector else None,
            embedding_model='gemini-embedding-001' if vector else '',
            embedding_hash=ai.fingerprint(text) if vector else '')

    def test_cosine_known_angles_and_binary_roundtrip(self):
        a = ai.unpack_vector(ai.pack_vector([1.,0.]))
        self.assertEqual(ai.cosine_similarity(a,[1.,0.]),1)
        self.assertEqual(ai.cosine_similarity(a,[0.,1.]),0)
        self.assertEqual(ai.cosine_similarity(a,[-1.,0.]),-1)

    def test_invalid_vectors(self):
        for values in [[],[0.,0.],[float('nan')],[float('inf')]]:
            with self.assertRaises(ai.AIError):
                ai.pack_vector(values)
        with self.assertRaises(ai.AIError):
            ai.cosine_similarity([1.],[1.,2.])
        with self.assertRaises(ai.AIError):
            ai.unpack_vector(b'abc')

    @patch('movie.ai.get_embedding', return_value=[1.]+[0.]*767)
    def test_recommend_ranks_and_ignores_stale(self, embed):
        chosen = self.movie(vector=[1.]+[0.]*767)
        self.movie('Comedia','Risas',[0.,1.]+[0.]*766)
        stale = self.movie('Vieja','Anterior',[1.]+[0.]*767)
        stale.description = 'Nueva descripción'
        stale.save()
        result, score = ai.recommend('Viaje entre estrellas')
        self.assertEqual(result.pk,chosen.pk)
        self.assertEqual(score,1)
        embed.assert_called_once()

    @patch('movie.ai.get_embedding')
    def test_no_usable_catalog_does_not_call_api(self, embed):
        self.movie(vector=[1.,0.])
        with self.assertRaises(ai.AIError):
            ai.recommend('Una aventura')
        embed.assert_not_called()

    @patch('movie.views.recommend')
    def test_get_and_invalid_post_do_not_call_api(self, recommend):
        self.assertEqual(self.client.get('/recommendations/').status_code,200)
        self.assertEqual(self.client.post('/recommendations/',{'prompt':'  '}).status_code,200)
        recommend.assert_not_called()

    @patch('movie.views.recommend', side_effect=ai.AIError('Cuota gratuita agotada.'))
    def test_quota_error_visible(self, recommend):
        response = self.client.post('/recommendations/',{'prompt':'Viaje espacial'})
        self.assertContains(response,'Cuota gratuita agotada.')

    @patch('movie.ai.get_embedding',return_value=[1.]+[0.]*767)
    def test_post_displays_recommendation(self, embed):
        self.movie(title='Viaje de prueba',vector=[1.]+[0.]*767)
        response = self.client.post('/recommendations/',{'prompt':'Viaje espacial'})
        self.assertContains(response,'Viaje de prueba')
        self.assertContains(response,'1.0000')

    def test_csv_updates_only_matches_and_invalidates_vectors(self):
        movie = self.movie(vector=[1.,0.])
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder)/'data.csv'
            with path.open('w',newline='',encoding='utf-8') as file:
                writer=csv.writer(file)
                writer.writerow(['Title','Updated Description'])
                writer.writerow([movie.title,'Nueva descripción'])
                writer.writerow(['Ajena','No corresponde'])
            call_command('update_movies_from_csv',file=str(path),stdout=io.StringIO())
        movie.refresh_from_db()
        self.assertEqual(movie.description,'Nueva descripción')
        self.assertIsNone(movie.emb)
        self.assertEqual(Movie.objects.count(),1)

    @patch('movie.management.commands.movie_embeddings.get_embedding', return_value=[1.]+[0.]*767)
    def test_embedding_command_resumes(self, embed):
        self.movie()
        self.movie('Segunda','Otra')
        for _ in range(3):
            call_command('movie_embeddings',limit=1,delay=0,stdout=io.StringIO())
        self.assertEqual(embed.call_count,2)
        self.assertEqual(Movie.objects.exclude(emb=None).count(),2)

    def test_csv_can_extend_catalog_without_duplicates_or_invented_metadata(self):
        original = self.movie()
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / 'data.csv'
            path.write_text('Title,Updated Description\nCarmencita,Una danza\n', encoding='utf-8')
            for _ in range(2):
                call_command('update_movies_from_csv', file=str(path), create_missing=True, stdout=io.StringIO())
        imported = Movie.objects.get(title='Carmencita')
        self.assertEqual(Movie.objects.count(), 2)
        self.assertIsNone(imported.year)
        self.assertEqual(imported.genre, '')
        self.assertIsNone(imported.emb)
        original.refresh_from_db()
        self.assertEqual(original.description, 'Viaje espacial')

    @patch('movie.management.commands.update_descriptions.get_description',return_value='Generada para prueba')
    def test_description_updates_only_one(self, generate):
        self.movie()
        self.movie('Segunda','Original')
        call_command('update_descriptions',stdout=io.StringIO())
        self.assertEqual(Movie.objects.filter(description='Generada para prueba').count(),1)
        generate.assert_called_once()

    @patch('movie.ai.config',return_value={})
    def test_missing_key_safe(self, config):
        with self.assertRaisesMessage(ai.AIError,'Falta configurar'):
            ai.client()

    @patch('movie.ai.config',return_value={'GEMINI_API_KEY':'secret-test'})
    def test_free_tier_confirmation_required(self, config):
        with self.assertRaisesMessage(ai.AIError,'Free tier'):
            ai.client()

    def test_previous_pages(self):
        for url in ['/','/news/','/about/','/statistics/']:
            self.assertEqual(self.client.get(url).status_code,200,url)

    def test_restore_catalog_on_empty_database_and_refuse_overwrite(self):
        call_command('restore_taller3',stdout=io.StringIO())
        self.assertEqual(Movie.objects.count(),150)
        self.assertEqual(sum(ai.current_embedding(m) for m in Movie.objects.all()),150)
        with self.assertRaisesMessage(CommandError,'No se sobrescribe'):
            call_command('restore_taller3',stdout=io.StringIO())
