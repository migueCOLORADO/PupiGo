"""Feature 17 (UH17 #226): seleccion de rol y acceso del conductor en /auth0-cond."""
import os
import random
import string
from io import StringIO
from unittest import mock

from django.contrib.auth.models import Group, User
from django.core.management import call_command
from django.test import TestCase, override_settings
from rest_framework.test import APITestCase

PW = "clave-prueba-f17"  # solo para estas pruebas, usuarios descartables
LOGIN = "/api/auth/login/"


def make_user(username, role, password=PW):
    user = User.objects.create_user(username, password=password)
    user.groups.add(Group.objects.get_or_create(name=role)[0])
    return user


class DriverAccessTests(APITestCase):
    def setUp(self):
        make_user("cond", "conductor")
        make_user("est", "estudiante")

    def login(self, username, password=PW):
        return self.client.post(LOGIN, {"username": username, "password": password}, format="json")

    def test_conductor_valido_obtiene_token_de_conductor(self):
        r = self.login("cond")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.data["role"], "conductor")
        self.assertTrue(r.data["token"])

    def test_error_generico_identico(self):
        mala = self.login("cond", "otra-clave")
        inexistente = self.login("no-existe", "otra-clave")
        vacio = self.login("", "")
        self.assertEqual({mala.status_code, inexistente.status_code, vacio.status_code}, {400})
        self.assertEqual(mala.data, inexistente.data)
        self.assertEqual(mala.data, vacio.data)
        self.assertEqual(set(mala.data), {"detail"})
        self.assertNotIn("usuario", str(mala.data["detail"]).lower())
        self.assertNotIn("contrasena", str(mala.data["detail"]).lower())

    def test_estudiante_no_obtiene_acceso_de_conductor(self):
        r = self.login("est")
        self.assertEqual((r.status_code, r.data["role"]), (200, "estudiante"))
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {r.data['token']}")
        self.assertEqual(self.client.post("/api/trips/", {"direction": "ida"}).status_code, 403)
        self.assertEqual(self.client.post("/api/trips/1/start/").status_code, 403)
        self.assertEqual(self.client.post("/api/trips/1/positions/", {}).status_code, 403)
        self.assertEqual(self.client.get("/api/auth/me/").data["role"], "estudiante")


class SeedUsersTests(TestCase):
    def run_seed(self, env):
        out = StringIO()
        with mock.patch.dict(os.environ, env, clear=False):
            if not env:
                os.environ.pop("PUPIGO_DEMO_PASSWORD", None)
            call_command("seed_users", stdout=out)
        return out.getvalue()

    def test_actualiza_clave_de_usuario_existente_con_la_variable(self):
        make_user("conductor", "conductor", password="clave-vieja-1")
        make_user("estudiante", "estudiante", password="clave-vieja-2")
        nueva = "clave-nueva-desde-entorno"
        out = self.run_seed({"PUPIGO_DEMO_PASSWORD": nueva})
        self.assertNotIn(nueva, out)
        for name in ("conductor", "estudiante"):
            self.assertTrue(User.objects.get(username=name).check_password(nueva))
        # Idempotente: una segunda corrida no duplica usuarios ni grupos ni cambia la clave.
        self.run_seed({"PUPIGO_DEMO_PASSWORD": nueva})
        self.assertEqual(User.objects.filter(username__in=["conductor", "estudiante"]).count(), 2)
        self.assertEqual(Group.objects.filter(name__in=["conductor", "estudiante"]).count(), 2)
        cond = User.objects.get(username="conductor")
        self.assertTrue(cond.check_password(nueva))
        self.assertEqual(list(cond.groups.values_list("name", flat=True)), ["conductor"])
        r = self.client.post(LOGIN, {"username": "conductor", "password": nueva}, content_type="application/json")
        self.assertEqual((r.status_code, r.json()["role"]), (200, "conductor"))

    def test_sin_variable_no_cambia_clave_existente(self):
        make_user("conductor", "conductor", password="clave-vieja-1")
        self.run_seed({})
        self.assertTrue(User.objects.get(username="conductor").check_password("clave-vieja-1"))
        self.assertTrue(User.objects.get(username="estudiante").has_usable_password())


@override_settings(PASSWORD_HASHERS=["django.contrib.auth.hashers.MD5PasswordHasher"])
class LoginMonteCarloTests(APITestCase):
    """Monte Carlo: N pares aleatorios usuario/clave; solo los pares validos dan 200 y el error es uno solo."""

    N = 400
    SEED = 20261109

    def setUp(self):
        self.valid = {"cond": "c-" + PW, "est": "e-" + PW, "otro_cond": "o-" + PW}
        roles = {"cond": "conductor", "est": "estudiante", "otro_cond": "conductor"}
        for name, pw in self.valid.items():
            make_user(name, roles[name], password=pw)
        self.roles = roles

    def test_solo_pares_validos_entran_y_error_identico(self):
        rng = random.Random(self.SEED)
        alphabet = string.ascii_letters + string.digits + "-_.!@"

        def rand_str(lo=1, hi=20):
            return "".join(rng.choice(alphabet) for _ in range(rng.randint(lo, hi)))

        counts = {"valido": 0, "clave_mala": 0, "inexistente": 0}
        bodies = {"clave_mala": set(), "inexistente": set()}
        for _ in range(self.N):
            kind = rng.choice(list(counts))
            if kind == "valido":
                user = rng.choice(list(self.valid))
                pw = self.valid[user]
            elif kind == "clave_mala":
                user = rng.choice(list(self.valid))
                pw = rand_str()
                if pw == self.valid[user]:
                    pw += "x"
            else:
                user = rand_str()
                while user in self.valid:
                    user = rand_str()
                pw = rng.choice([rand_str(), *self.valid.values()])
            counts[kind] += 1
            r = self.client.post(LOGIN, {"username": user, "password": pw}, format="json")
            if kind == "valido":
                self.assertEqual(r.status_code, 200, (user, kind))
                self.assertEqual(r.data["role"], self.roles[user])
                # /auth0-cond solo deja pasar al rol conductor
                self.assertEqual(r.data["role"] == "conductor", user in ("cond", "otro_cond"))
            else:
                self.assertEqual(r.status_code, 400, (user, kind))
                self.assertNotIn("token", r.data)
                bodies[kind].add(r.content)
        self.assertGreaterEqual(min(counts.values()), 50, counts)
        self.assertEqual(len(bodies["clave_mala"]), 1)
        self.assertEqual(bodies["clave_mala"], bodies["inexistente"])
