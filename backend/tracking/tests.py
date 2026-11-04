from datetime import timedelta

from django.conf import settings
from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework.test import APITestCase
from .models import Driver, Position, Route, Stop, Trip, Vehicle
from .serializers import RouteSerializer


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


class AdminRecordsApiTests(APITestCase):
    """UH14 / RF-45: un registro desactivado no se puede usar en recorridos nuevos."""

    def setUp(self):
        self.route = Route.objects.create(name="r", origin_name="A", origin_lat=6.19, origin_lng=-75.58,
                                          destination_name="B", destination_lat=6.20, destination_lng=-75.57)
        self.vehicle = Vehicle.objects.create(plate="X1")
        self.driver = Driver.objects.create(name="D")

    def post_trip(self, **extra):
        return self.client.post("/api/trips/", {"direction": "ida", **extra})

    def test_registros_nuevos_quedan_activos(self):
        # RF-43 / RF-44: lo que se acaba de crear esta disponible
        for registro in (self.route, self.vehicle, self.driver):
            self.assertTrue(registro.is_active, registro)
        parada = Stop.objects.create(route=self.route, name="Parada", lat=6.19, lng=-75.58, order=1)
        self.assertTrue(parada.is_active)

    def test_recorrido_por_defecto_salta_los_registros_desactivados(self):
        # Desactivar un vehiculo no rompe la app si queda otro activo
        activo = Vehicle.objects.create(plate="X2", name="Pupi Bus 2")
        self.vehicle.is_active = False
        self.vehicle.save()
        r = self.post_trip()
        self.assertEqual(r.status_code, 201, r.data)
        self.assertEqual(Trip.objects.get(pk=r.data["id"]).vehicle_id, activo.pk)

    def test_vehiculo_desactivado_explicito_es_rechazado(self):
        self.vehicle.is_active = False
        self.vehicle.save()
        Vehicle.objects.create(plate="X2")  # hay alternativa activa, pero se pide el desactivado
        r = self.post_trip(vehicle_id=self.vehicle.pk)
        self.assertEqual(r.status_code, 400, r.data)
        self.assertIn("vehiculo", r.data["detail"])
        self.assertIn("desactivado", r.data["detail"])
        self.assertEqual(Trip.objects.count(), 0)

    def test_ruta_desactivada_explicita_es_rechazada(self):
        self.route.is_active = False
        self.route.save()
        Route.objects.create(name="r2", origin_name="A", origin_lat=6.19, origin_lng=-75.58,
                             destination_name="B", destination_lat=6.20, destination_lng=-75.57)
        r = self.post_trip(route_id=self.route.pk)
        self.assertEqual(r.status_code, 400, r.data)
        self.assertIn("ruta", r.data["detail"])
        self.assertEqual(Trip.objects.count(), 0)

    def test_conductor_desactivado_explicito_es_rechazado(self):
        self.driver.is_active = False
        self.driver.save()
        Driver.objects.create(name="D2")
        r = self.post_trip(driver_id=self.driver.pk)
        self.assertEqual(r.status_code, 400, r.data)
        self.assertIn("conductor", r.data["detail"])
        self.assertEqual(Trip.objects.count(), 0)

    def test_sin_registros_activos_el_mensaje_dice_que_falta(self):
        # Escenario "datos obligatorios incompletos": el error nombra cada faltante
        for registro in (self.route, self.vehicle, self.driver):
            registro.is_active = False
            registro.save()
        r = self.post_trip()
        self.assertEqual(r.status_code, 400, r.data)
        detalle = r.data["detail"]
        for etiqueta in ("ruta", "vehiculo", "conductor"):
            self.assertIn(etiqueta, detalle)
        self.assertIn("seed", detalle)
        self.assertEqual(Trip.objects.count(), 0)

    def test_recorridos_ya_realizados_se_conservan(self):
        tid = self.post_trip().data["id"]
        self.client.post(f"/api/trips/{tid}/start/")
        self.client.post(f"/api/trips/{tid}/positions/", {"lat": 6.195, "lng": -75.58, "timestamp": timezone.now()})
        self.client.post(f"/api/trips/{tid}/complete/")
        for registro in (self.route, self.vehicle, self.driver):
            registro.is_active = False
            registro.save()
        # El recorrido viejo sigue completo y consultable, con sus relaciones intactas
        viejo = Trip.objects.get(pk=tid)
        self.assertEqual(viejo.status, Trip.COMPLETED)
        self.assertEqual((viejo.route_id, viejo.vehicle_id, viejo.driver_id),
                         (self.route.pk, self.vehicle.pk, self.driver.pk))
        self.assertEqual(viejo.positions.count(), 1)
        detalle = self.client.get(f"/api/trips/{tid}/")
        self.assertEqual(detalle.status_code, 200)
        self.assertEqual(detalle.data["status"], "completed")
        # Desactivar no borra filas
        self.assertEqual(Route.objects.count(), 1)
        self.assertEqual(Vehicle.objects.count(), 1)
        self.assertEqual(Driver.objects.count(), 1)

    def test_parada_desactivada_no_se_publica_pero_se_conserva(self):
        Stop.objects.create(route=self.route, name="Aguacatala", lat=6.19, lng=-75.58, order=1)
        fuera = Stop.objects.create(route=self.route, name="Las Hermosas", lat=6.20, lng=-75.57, order=2)
        self.assertEqual(len(RouteSerializer(self.route).data["stops"]), 2)
        fuera.is_active = False
        fuera.save()
        paradas = RouteSerializer(self.route).data["stops"]
        self.assertEqual([p["name"] for p in paradas], ["Aguacatala"])
        self.assertEqual(Stop.objects.count(), 2)  # la fila sigue en BD


class AdminScreensTests(APITestCase):
    """UH14: el administrador gestiona los registros desde el Django Admin (RF-43, RF-44)."""

    def setUp(self):
        User.objects.create_superuser("admin", "admin@pupigo.co", "pupigo-test-pass")
        self.client.login(username="admin", password="pupigo-test-pass")
        self.route = Route.objects.create(name="r", origin_name="A", origin_lat=6.19, origin_lng=-75.58,
                                          destination_name="B", destination_lat=6.20, destination_lng=-75.57)
        self.vehicle = Vehicle.objects.create(plate="X1")
        self.driver = Driver.objects.create(name="D")

    def test_pantallas_de_gestion_disponibles(self):
        for modelo in ("route", "stop", "vehicle", "driver"):
            self.assertEqual(self.client.get(f"/admin/tracking/{modelo}/").status_code, 200, modelo)
            self.assertEqual(self.client.get(f"/admin/tracking/{modelo}/add/").status_code, 200, modelo)

    def test_crear_y_editar_conductor(self):
        r = self.client.post("/admin/tracking/driver/add/", {"name": "Nuevo", "is_active": "on"})
        self.assertEqual(r.status_code, 302, getattr(r, "context", None) and r.context["adminform"].form.errors)
        nuevo = Driver.objects.get(name="Nuevo")
        self.client.post(f"/admin/tracking/driver/{nuevo.pk}/change/", {"name": "Editado", "is_active": "on"})
        nuevo.refresh_from_db()
        self.assertEqual(nuevo.name, "Editado")

    def test_datos_obligatorios_incompletos_se_rechazan_indicando_que_falta(self):
        r = self.client.post("/admin/tracking/driver/add/", {"is_active": "on"})
        self.assertEqual(r.status_code, 200)  # vuelve al formulario, no guarda
        self.assertIn("name", r.context["adminform"].form.errors)
        self.assertFalse(Driver.objects.filter(name="").exists())

        r = self.client.post("/admin/tracking/vehicle/add/", {"is_active": "on"})
        self.assertIn("plate", r.context["adminform"].form.errors)

        r = self.client.post("/admin/tracking/route/add/", {"name": "sin coordenadas", "is_active": "on"})
        faltantes = r.context["adminform"].form.errors
        for campo in ("origin_name", "origin_lat", "origin_lng",
                      "destination_name", "destination_lat", "destination_lng"):
            self.assertIn(campo, faltantes)
        self.assertFalse(Route.objects.filter(name="sin coordenadas").exists())

    def test_accion_desactivar_y_activar_desde_el_admin(self):
        for modelo, obj in (("vehicle", self.vehicle), ("driver", self.driver), ("route", self.route)):
            url = f"/admin/tracking/{modelo}/"
            seleccion = {"_selected_action": [str(obj.pk)], "index": 0}
            self.client.post(url, {"action": "desactivar", **seleccion}, follow=True)
            obj.refresh_from_db()
            self.assertFalse(obj.is_active, modelo)
            self.client.post(url, {"action": "activar", **seleccion}, follow=True)
            obj.refresh_from_db()
            self.assertTrue(obj.is_active, modelo)

    def test_paradas_se_editan_dentro_de_la_ruta(self):
        # RF-44: el inline de paradas aparece en la pantalla de la ruta
        r = self.client.get(f"/admin/tracking/route/{self.route.pk}/change/")
        self.assertEqual(r.status_code, 200)
        self.assertIn("stops-0-name", r.content.decode())

