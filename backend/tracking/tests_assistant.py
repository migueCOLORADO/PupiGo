import io
import json
import urllib.error
from unittest import mock

from django.utils import timezone
from rest_framework.test import APITestCase

from . import assistant
from .models import Driver, Position, Route, Trip, Vehicle

URL = "/api/assistant/"
NO_KEY = (None, None)
WITH_KEY = ("test-key", "test-model")


def fake_response(payload):
    resp = mock.MagicMock()
    resp.read.return_value = json.dumps(payload).encode("utf-8")
    resp.__enter__.return_value = resp
    return resp


class AssistantTests(APITestCase):
    def setUp(self):
        self.route = Route.objects.create(
            name="Aguacatala - Las Hermosas", origin_name="Estación Aguacatala", origin_lat=6.19385,
            origin_lng=-75.58180, destination_name="Entrada Las Hermosas", destination_lat=6.19960,
            destination_lng=-75.57850)
        self.vehicle = Vehicle.objects.create(plate="TST123", name="Pupi Bus")
        self.driver = Driver.objects.create(name="Conductor Prueba")

    def make_trip(self, status=Trip.IN_PROGRESS, with_position=True):
        trip = Trip.objects.create(route=self.route, vehicle=self.vehicle, driver=self.driver, status=status)
        if with_position:
            Position.objects.create(trip=trip, lat=6.1960, lng=-75.5805, timestamp=timezone.now())
        return trip

    def ask(self, question, config=NO_KEY):
        with mock.patch.object(assistant, "ai_config", return_value=config):
            return self.client.post(URL, {"question": question}, format="json")

    def test_fallback_uses_real_trip_data(self):
        self.make_trip()
        r = self.ask("¿Dónde está el colectivo?")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.data["source"], "fallback")
        self.assertIn("en curso", r.data["answer"])
        self.assertIn("TST123", r.data["answer"])
        self.assertIn("Conductor Prueba", r.data["answer"])
        self.assertIn("Entrada Las Hermosas", r.data["answer"])
        self.assertIn("desactivado", r.data["notice"])

    def test_ai_answer_receives_real_data(self):
        self.make_trip()
        payload = {"content": [{"type": "text", "text": "El colectivo va hacia EAFIT."}], "stop_reason": "end_turn"}
        with mock.patch.object(assistant.urllib.request, "urlopen", return_value=fake_response(payload)) as op:
            r = self.ask("¿Dónde está el colectivo?", WITH_KEY)
        self.assertEqual(r.data, {"answer": "El colectivo va hacia EAFIT.", "source": "ai", "notice": None})
        req, = op.call_args.args
        self.assertLessEqual(op.call_args.kwargs["timeout"], 10)
        self.assertEqual(req.get_header("X-api-key"), "test-key")
        sent = json.loads(req.data)
        self.assertEqual(sent["model"], "test-model")
        self.assertIn("TST123", sent["messages"][0]["content"])

    def test_no_active_trip_reports_last_known_position(self):
        trip = self.make_trip()
        trip.complete()
        r = self.ask("¿El colectivo ya salió?")
        self.assertEqual(r.status_code, 200)
        self.assertIn("No hay un recorrido en curso", r.data["answer"])
        self.assertIn("Última posición conocida", r.data["answer"])

    def test_no_active_trip_without_positions(self):
        r = self.ask("¿Dónde está el bus?")
        self.assertIn("No hay un recorrido en curso", r.data["answer"])
        self.assertIn("No hay ninguna posición", r.data["answer"])

    def test_waiting_trip_without_gps(self):
        self.make_trip(status=Trip.WAITING, with_position=False)
        r = self.ask("¿Cuándo sale el colectivo?")
        self.assertIn("en espera", r.data["answer"])
        self.assertIn("Todavía no hay posición GPS", r.data["answer"])

    def test_provider_error_falls_back(self):
        self.make_trip()
        with mock.patch.object(assistant.urllib.request, "urlopen", side_effect=urllib.error.URLError("down")):
            r = self.ask("¿Dónde está el colectivo?", WITH_KEY)
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.data["source"], "fallback")
        self.assertIn("no está disponible", r.data["notice"])
        self.assertIn("TST123", r.data["answer"])

    def test_provider_http_error_and_timeout_fall_back(self):
        self.make_trip()
        errors = [
            urllib.error.HTTPError(assistant.API_URL, 529, "overloaded", {}, io.BytesIO(b"{}")),
            TimeoutError(),
        ]
        for err in errors:
            with mock.patch.object(assistant.urllib.request, "urlopen", side_effect=err):
                r = self.ask("¿Dónde está el colectivo?", WITH_KEY)
            self.assertEqual((r.status_code, r.data["source"]), (200, "fallback"))

    def test_invalid_or_refused_ai_response_falls_back(self):
        self.make_trip()
        for payload in ({"content": [], "stop_reason": "end_turn"}, {"content": [], "stop_reason": "refusal"}, []):
            with mock.patch.object(assistant.urllib.request, "urlopen", return_value=fake_response(payload)):
                r = self.ask("¿Dónde está el colectivo?", WITH_KEY)
            self.assertEqual(r.data["source"], "fallback")

    def test_out_of_scope_question_in_fallback(self):
        r = self.ask("¿Cuál es la capital de Francia?")
        self.assertEqual(r.data["answer"], "Solo puedo responder preguntas sobre el colectivo EAFIT-Metro.")

    def test_invalid_question(self):
        for body in ({}, {"question": ""}, {"question": "   "}, {"question": 5}, {"question": "x" * 301}):
            with mock.patch.object(assistant, "ai_config", return_value=NO_KEY):
                r = self.client.post(URL, body, format="json")
            self.assertEqual(r.status_code, 400, body)

    def test_unexpected_error_never_500(self):
        with mock.patch.object(assistant, "build_context", side_effect=RuntimeError("db")):
            r = self.ask("¿Dónde está el colectivo?")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.data["source"], "fallback")

    def test_trip_api_unaffected(self):
        self.make_trip()
        with mock.patch.object(assistant.urllib.request, "urlopen", side_effect=urllib.error.URLError("down")):
            self.ask("¿Dónde está el colectivo?", WITH_KEY)
        self.assertEqual(self.client.get("/api/trips/active/").data["status"], "in_progress")
