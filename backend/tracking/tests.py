from datetime import timedelta

from django.conf import settings
from django.utils import timezone
from rest_framework.test import APITestCase
from .models import Driver, Position, Route, Trip, Vehicle


class TripApiTests(APITestCase):
    def setUp(self):
        Route.objects.create(name="r", origin_name="A", origin_lat=6.19, origin_lng=-75.58,
                             destination_name="B", destination_lat=6.20, destination_lng=-75.57)
        Vehicle.objects.create(plate="X1")
        Driver.objects.create(name="D")

    def create(self, direction="ida"):
        r = self.client.post("/api/trips/", {"direction": direction})
        self.assertEqual(r.status_code, 201, r.data)
        return r.data["id"]

    def test_full_flow_waiting_in_progress_completed(self):
        tid = self.create()
        self.assertEqual(self.client.get("/api/trips/active/").data["status"], "waiting")
        r = self.client.post(f"/api/trips/{tid}/positions/", {"lat": 6.19, "lng": -75.58, "timestamp": timezone.now()})
        self.assertEqual(r.status_code, 409)  # sin GPS en espera
        self.assertEqual(self.client.post(f"/api/trips/{tid}/start/").data["status"], "in_progress")
        r = self.client.post(f"/api/trips/{tid}/positions/", {"lat": 6.195, "lng": -75.58, "timestamp": timezone.now()})
        self.assertEqual(r.status_code, 201)
        active = self.client.get("/api/trips/active/").data
        self.assertAlmostEqual(active["last_position"]["lat"], 6.195)
        self.assertEqual(self.client.post(f"/api/trips/{tid}/complete/").data["status"], "completed")
        self.assertIsNone(self.client.get("/api/trips/active/").data)

    def test_cancel_from_waiting_and_in_progress(self):
        tid = self.create()
        self.assertEqual(self.client.post(f"/api/trips/{tid}/cancel/").data["status"], "cancelled")
        tid = self.create()
        self.client.post(f"/api/trips/{tid}/start/")
        self.assertEqual(self.client.post(f"/api/trips/{tid}/cancel/").data["status"], "cancelled")

    def test_invalid_transitions(self):
        tid = self.create()
        self.assertEqual(self.client.post(f"/api/trips/{tid}/complete/").status_code, 409)
        self.client.post(f"/api/trips/{tid}/cancel/")
        self.assertEqual(self.client.post(f"/api/trips/{tid}/start/").status_code, 409)

    def test_only_one_active_trip(self):
        self.create()
        self.assertEqual(self.client.post("/api/trips/", {"direction": "vuelta"}).status_code, 400)


class LastKnownPositionTests(APITestCase):
    """UH4: conservar la ultima posicion GPS conocida (NFR disponibilidad ante interrupcion GPS)."""

    def setUp(self):
        Route.objects.create(name="r", origin_name="A", origin_lat=6.19, origin_lng=-75.58,
                             destination_name="B", destination_lat=6.20, destination_lng=-75.57)
        Vehicle.objects.create(plate="X1")
        Driver.objects.create(name="D")
        r = self.client.post("/api/trips/", {"direction": "ida"})
        self.tid = r.data["id"]

    def start(self):
        self.client.post(f"/api/trips/{self.tid}/start/")

    def send(self, lat, lng, ts=None):
        return self.client.post(f"/api/trips/{self.tid}/positions/",
                                {"lat": lat, "lng": lng, "timestamp": ts or timezone.now()})

    def active(self):
        return self.client.get("/api/trips/active/").data

    def test_waiting_trip_has_no_position_yet(self):
        data = self.active()
        self.assertIsNone(data["last_position"])
        self.assertIsNone(data["position_age_seconds"])

    def test_last_position_is_kept_when_gps_stops(self):
        self.start()
        self.assertEqual(self.send(6.195, -75.58).status_code, 201)
        # Interrupcion: la ultima lectura se recibio hace mucho mas que el intervalo esperado
        Position.objects.filter(trip_id=self.tid).update(
            received_at=timezone.now() - timedelta(seconds=settings.GPS_MAX_INTERVAL_SECONDS + 45))
        for _ in range(3):  # varias consultas de estudiantes sin nuevas posiciones
            data = self.active()
            self.assertEqual(data["status"], "in_progress")
            self.assertIsNotNone(data["last_position"])
            self.assertAlmostEqual(data["last_position"]["lat"], 6.195)
            self.assertGreater(data["position_age_seconds"], data["gps_max_interval_seconds"])

    def test_fresh_position_reports_small_age(self):
        self.start()
        self.send(6.195, -75.58)
        self.assertLess(self.active()["position_age_seconds"], settings.GPS_MAX_INTERVAL_SECONDS)

    def test_new_position_replaces_previous_after_interruption(self):
        self.start()
        now = timezone.now()
        self.send(6.191, -75.58, now - timedelta(seconds=60))
        Position.objects.filter(trip_id=self.tid).update(received_at=now - timedelta(seconds=60))
        self.assertAlmostEqual(self.active()["last_position"]["lat"], 6.191)
        self.assertEqual(self.send(6.198, -75.575, now).status_code, 201)
        data = self.active()
        self.assertAlmostEqual(data["last_position"]["lat"], 6.198)
        self.assertAlmostEqual(data["last_position"]["lng"], -75.575)
        self.assertLess(data["position_age_seconds"], settings.GPS_MAX_INTERVAL_SECONDS)

    def test_invalid_position_does_not_replace_last_known(self):
        self.start()
        self.send(6.195, -75.58)
        for bad in ({"lat": 999, "lng": -75.58}, {"lat": 6.2, "lng": -999}, {"lat": "nan", "lng": -75.58}):
            r = self.client.post(f"/api/trips/{self.tid}/positions/", {**bad, "timestamp": timezone.now()})
            self.assertEqual(r.status_code, 400, bad)
        self.assertAlmostEqual(self.active()["last_position"]["lat"], 6.195)
        self.assertEqual(Position.objects.filter(trip_id=self.tid).count(), 1)

    def test_last_position_not_shown_once_trip_is_over(self):
        # Recorrido terminado/cancelado deja de ser "activo": no se sigue mostrando el bus
        self.start()
        self.send(6.195, -75.58)
        self.client.post(f"/api/trips/{self.tid}/cancel/")
        self.assertIsNone(self.active())