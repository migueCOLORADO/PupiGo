
from django.test import TestCase

from .models import (
    Driver,
    InvalidTransition,
    Route,
    Trip,
    TripEvent,
    Vehicle,
)


class Feature13Tests(TestCase):

    def setUp(self):
        route = Route.objects.create(
            name="Ruta de prueba",
            origin_name="Metro",
            origin_lat=6.19385,
            origin_lng=-75.58180,
            destination_name="EAFIT",
            destination_lat=6.19960,
            destination_lng=-75.57850,
        )

        vehicle = Vehicle.objects.create(plate="TEST13")
        driver = Driver.objects.create(name="Conductor prueba")

        self.trip = Trip.objects.create(
            route=route,
            vehicle=vehicle,
            driver=driver,
            direction="ida",
        )

    def test_notificacion_inicio(self):
        self.trip.start()

        self.assertTrue(
            TripEvent.objects.filter(
                trip=self.trip,
                event_type=TripEvent.STARTED,
            ).exists()
        )

    def test_notificacion_cancelacion(self):
        self.trip.start()
        self.trip.cancel()

        self.assertEqual(
            TripEvent.objects.filter(
                trip=self.trip
            ).count(),
            2,
        )

    def test_no_duplicar_eventos(self):
        self.trip.start()

        with self.assertRaises(InvalidTransition):
            self.trip.start()

        self.assertEqual(
            TripEvent.objects.filter(
                trip=self.trip,
                event_type=TripEvent.STARTED,
            ).count(),
            1,
        )

    def test_api_filtra_eventos(self):
        self.trip.start()
        self.trip.cancel()

        inicio = TripEvent.objects.get(
            trip=self.trip,
            event_type=TripEvent.STARTED,
        )

        response = self.client.get(
            f"/api/trip-events/?after={inicio.id}"
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(
            response.data[0]["event_type"],
            TripEvent.CANCELLED,
        )
