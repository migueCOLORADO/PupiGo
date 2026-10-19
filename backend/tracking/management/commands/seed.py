from django.core.management.base import BaseCommand
from tracking.models import Driver, Route, Stop, Vehicle


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

        paradas = [
            (route.origin_name, route.origin_lat, route.origin_lng),
            (route.destination_name, route.destination_lat, route.destination_lng),
        ]

        for orden, (nombre, lat, lng) in enumerate(paradas, start=1):
            Stop.objects.get_or_create(
                route=route,
                name=nombre,
                defaults={
                    "lat": lat,
                    "lng": lng,
                    "order": orden,
                },
            )

        Vehicle.objects.get_or_create(plate="PUPI01", defaults={"name": "Pupi Bus"})
        Driver.objects.get_or_create(name="Conductor PupiGo")
        self.stdout.write(self.style.SUCCESS("Seed OK: %s" % route))
