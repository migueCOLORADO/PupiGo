import os
import secrets

from django.contrib.auth.models import Group, User
from django.core.management.base import BaseCommand

from tracking.permissions import ROLE_CONDUCTOR, ROLE_ESTUDIANTE


class Command(BaseCommand):
    help = "Crea los grupos de rol y los usuarios demo conductor y estudiante (idempotente)."

    def handle(self, *args, **opts):
        password = os.environ.get("PUPIGO_DEMO_PASSWORD")
        generated = not password
        if generated:
            password = secrets.token_urlsafe(9)
        created_any = False
        for role in (ROLE_CONDUCTOR, ROLE_ESTUDIANTE):
            group, _ = Group.objects.get_or_create(name=role)
            user, created = User.objects.get_or_create(username=role)
            if created:
                user.set_password(password)
                user.save()
                created_any = True
            user.groups.add(group)
            self.stdout.write(f"{'creado' if created else 'existente'}: {role}")
        if created_any and generated:
            self.stdout.write(f"Clave generada (se muestra una sola vez): {password}")
