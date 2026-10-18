from django.core.management.base import BaseCommand
from tracking.models import Driver, Route, Vehicle


class Command(BaseCommand):
    help = "Crea la ruta fija, el vehiculo y el conductor por defecto."

    def handle(self, *args, **opts):
        route, _ = Route.objects.get_or_create(
            name="Estación Aguacatala - Entrada Las Hermosas",
            defaults=dict(
                origin_name="Estación Aguacatala", origin_lat=6.19385, origin_lng=-75.58180,
                destination_name="Entrada Las Hermosas", destination_lat=6.19960, destination_lng=-75.57850,
            ),
        )
        Vehicle.objects.get_or_create(plate="PUPI01", defaults={"name": "Pupi Bus"})
        Driver.objects.get_or_create(name="Conductor PupiGo")
        self.stdout.write(self.style.SUCCESS("Seed OK: %s" % route))
