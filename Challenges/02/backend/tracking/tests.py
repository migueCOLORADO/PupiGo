from django.utils import timezone
from rest_framework.test import APITestCase
from .models import Driver, Route, Trip, Vehicle


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
