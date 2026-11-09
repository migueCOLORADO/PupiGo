from django.contrib.auth.hashers import identify_hasher
from django.contrib.auth.models import Group, User
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from .models import Driver, Route, Vehicle

PW = "clave-de-prueba-123"  # solo para estas pruebas, usuarios descartables


class AuthTests(APITestCase):
    def setUp(self):
        Route.objects.create(name="r", origin_name="A", origin_lat=6.19, origin_lng=-75.58,
                             destination_name="B", destination_lat=6.20, destination_lng=-75.57)
        Vehicle.objects.create(plate="X1")
        Driver.objects.create(name="D")
        self.driver = User.objects.create_user("cond", password=PW)
        self.driver.groups.add(Group.objects.create(name="conductor"))
        self.student = User.objects.create_user("est", password=PW)
        self.student.groups.add(Group.objects.create(name="estudiante"))

    def login(self, username="cond", password=PW):
        return self.client.post("/api/auth/login/", {"username": username, "password": password}, format="json")

    def token_of(self, username):
        return self.login(username).data["token"]

    def auth(self, token):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token}")

    def test_login_conductor_y_estudiante(self):
        r = self.login("cond")
        self.assertEqual(r.status_code, 200)
        self.assertEqual((r.data["username"], r.data["role"]), ("cond", "conductor"))
        self.assertTrue(r.data["token"])
        r = self.login("est")
        self.assertEqual((r.status_code, r.data["role"]), (200, "estudiante"))

    def test_credenciales_invalidas_respuesta_identica(self):
        mala = self.login("cond", "otra")
        inexistente = self.login("nadie", "otra")
        self.assertEqual(mala.status_code, 400)
        self.assertEqual(mala.status_code, inexistente.status_code)
        self.assertEqual(mala.data, inexistente.data)
        self.assertEqual(self.login("cond", None).status_code, 400)

    def test_usuario_sin_rol_recibe_403_generico(self):
        User.objects.create_user("sinrol", password=PW)
        self.assertEqual(self.login("sinrol").status_code, 403)

    def test_crear_recorrido_segun_rol(self):
        body = {"direction": "ida"}
        self.assertEqual(self.client.post("/api/trips/", body).status_code, 401)
        self.auth(self.token_of("est"))
        self.assertEqual(self.client.post("/api/trips/", body).status_code, 403)
        self.auth(self.token_of("cond"))
        self.assertEqual(self.client.post("/api/trips/", body).status_code, 201)

    def test_lectura_publica_y_acciones_protegidas(self):
        self.assertEqual(self.client.get("/api/trips/active/").status_code, 200)
        self.assertEqual(self.client.get("/api/trips/").status_code, 200)
        self.assertEqual(self.client.post("/api/trips/1/start/").status_code, 401)
        self.assertEqual(self.client.post("/api/trips/1/positions/", {}).status_code, 401)

    def test_logout_invalida_el_token(self):
        t = self.token_of("cond")
        self.auth(t)
        self.assertEqual(self.client.get("/api/auth/me/").status_code, 200)
        self.assertEqual(self.client.post("/api/auth/logout/").status_code, 204)
        self.assertFalse(Token.objects.filter(key=t).exists())
        self.assertEqual(self.client.get("/api/auth/me/").status_code, 401)

    def test_logout_sin_sesion(self):
        self.assertEqual(self.client.post("/api/auth/logout/").status_code, 401)

    def test_me(self):
        self.auth(self.token_of("est"))
        r = self.client.get("/api/auth/me/")
        self.assertEqual((r.data["username"], r.data["role"]), ("est", "estudiante"))

    def test_clave_no_se_guarda_en_texto_plano(self):
        stored = User.objects.get(username="cond").password
        self.assertNotEqual(stored, PW)
        self.assertNotIn(PW, stored)
        self.assertTrue(identify_hasher(stored))
