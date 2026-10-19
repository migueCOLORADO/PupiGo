
from django.test import TestCase
from tracking.models import Route, Stop
from tracking.serializers import RouteSerializer


class Feature6Tests(TestCase):

    @classmethod
    def setUpTestData(cls):
        cls.route = Route.objects.create(
            name="Ruta EAFIT-Metro",
            origin_name="Estación Aguacatala",
            origin_lat=6.19385,
            origin_lng=-75.5818,
            destination_name="Entrada Las Hermosas",
            destination_lat=6.1996,
            destination_lng=-75.5785,
        )

        Stop.objects.create(
            route=cls.route,
            name="Estación Aguacatala",
            lat=6.19385,
            lng=-75.5818,
            order=1,
        )

        Stop.objects.create(
            route=cls.route,
            name="Entrada Las Hermosas",
            lat=6.1996,
            lng=-75.5785,
            order=2,
        )

    def test_rf14_datos_de_ruta(self):
        datos = RouteSerializer(self.route).data
        self.assertEqual(datos["id"], self.route.id)
        self.assertEqual(
            datos["origin_name"], "Estación Aguacatala"
        )
        self.assertEqual(
            datos["destination_name"], "Entrada Las Hermosas"
        )

    def test_rf18_paradas_asociadas(self):
        paradas = list(self.route.stops.all())
        self.assertEqual(len(paradas), 2)
        self.assertEqual(paradas[0].order, 1)
        self.assertEqual(paradas[1].order, 2)

    def test_rf18_serializacion_de_paradas(self):
        datos = RouteSerializer(self.route).data
        self.assertEqual(len(datos["stops"]), 2)
        self.assertEqual(
            datos["stops"][0]["name"], "Estación Aguacatala"
        )
        self.assertIn("lat", datos["stops"][0])
        self.assertIn("lng", datos["stops"][0])
