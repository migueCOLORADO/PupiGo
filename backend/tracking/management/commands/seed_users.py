import os
import secrets

from django.contrib.auth.models import Group, User
from django.core.management.base import BaseCommand

from tracking.permissions import ROLE_CONDUCTOR, ROLE_ESTUDIANTE


class Command(BaseCommand):
    help = (
        "Crea los grupos de rol y los usuarios demo conductor y estudiante (idempotente). "
        "Si PUPIGO_DEMO_PASSWORD esta definida, fija esa clave aunque el usuario ya exista."
    )

    def handle(self, *args, **opts):
        password = os.environ.get("PUPIGO_DEMO_PASSWORD")
        from_env = bool(password)
        if not from_env:
            password = secrets.token_urlsafe(9)
        show_generated = False
        for role in (ROLE_CONDUCTOR, ROLE_ESTUDIANTE):
            group, _ = Group.objects.get_or_create(name=role)
            user, created = User.objects.get_or_create(username=role)
            # Con la variable definida la clave se sincroniza siempre (F17: /auth0-cond usa la clave
            # predefinida). Sin la variable solo se fija al crear, para no invalidar una clave existente.
            if created or from_env:
                if not user.check_password(password):
                    user.set_password(password)
                    user.save(update_fields=["password"])
                show_generated = show_generated or not from_env
            user.groups.add(group)
            estado = "creado" if created else ("clave sincronizada" if from_env else "existente")
            self.stdout.write(f"{estado}: {role}")
        if show_generated:
            self.stdout.write(f"Clave generada (se muestra una sola vez): {password}")
