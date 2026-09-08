from django.conf import settings
from django.db import models
from django.utils import timezone


class Route(models.Model):
    """Ruta fija Estacion Aguacatala <-> Entrada Las Hermosas (EAFIT)."""
    name = models.CharField(max_length=120)
    origin_name = models.CharField(max_length=120)
    origin_lat = models.FloatField()
    origin_lng = models.FloatField()
    destination_name = models.CharField(max_length=120)
    destination_lat = models.FloatField()
    destination_lng = models.FloatField()

    def __str__(self):
        return self.name


class Vehicle(models.Model):
    plate = models.CharField(max_length=12, unique=True)
    name = models.CharField(max_length=60, default="Pupi Bus")

    def __str__(self):
        return f"{self.name} ({self.plate})"


class Driver(models.Model):
    name = models.CharField(max_length=120)

    def __str__(self):
        return self.name


class InvalidTransition(Exception):
    pass


class Trip(models.Model):
    """Recorrido. Maquina de estados:
    En espera -> En curso -> Completado
    En espera -> Cancelado
    En curso  -> Cancelado
    """
    WAITING, IN_PROGRESS, COMPLETED, CANCELLED = "waiting", "in_progress", "completed", "cancelled"
    STATUS_CHOICES = [
        (WAITING, "En espera"), (IN_PROGRESS, "En curso"),
        (COMPLETED, "Completado"), (CANCELLED, "Cancelado"),
    ]
    ACTIVE_STATUSES = (WAITING, IN_PROGRESS)
    IDA, VUELTA = "ida", "vuelta"
    DIRECTION_CHOICES = [(IDA, "Metro -> EAFIT"), (VUELTA, "EAFIT -> Metro")]

    route = models.ForeignKey(Route, on_delete=models.PROTECT, related_name="trips")
    vehicle = models.ForeignKey(Vehicle, on_delete=models.PROTECT, related_name="trips")
    driver = models.ForeignKey(Driver, on_delete=models.PROTECT, related_name="trips")
    direction = models.CharField(max_length=6, choices=DIRECTION_CHOICES, default=IDA)
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default=WAITING)
    waiting_minutes = models.PositiveSmallIntegerField(default=settings.TRIP_WAITING_MINUTES)
    created_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    ended_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Trip #{self.pk} {self.direction} [{self.status}]"

    @property
    def is_active(self):
        return self.status in self.ACTIVE_STATUSES

    def _transition(self, allowed_from, new_status):
        if self.status not in allowed_from:
            labels = dict(self.STATUS_CHOICES)
            raise InvalidTransition(f"No se puede pasar de {labels[self.status]} a {labels[new_status]}.")
        self.status = new_status

    def start(self):  # RF-05
        self._transition((self.WAITING,), self.IN_PROGRESS)
        self.started_at = timezone.now()
        self.save(update_fields=["status", "started_at"])

    def complete(self):  # RF-19
        self._transition((self.IN_PROGRESS,), self.COMPLETED)
        self.ended_at = timezone.now()
        self.save(update_fields=["status", "ended_at"])

    def cancel(self):  # RF-19b
        self._transition(self.ACTIVE_STATUSES, self.CANCELLED)
        self.ended_at = timezone.now()
        self.save(update_fields=["status", "ended_at"])

    @property
    def last_position(self):
        return self.positions.order_by("-timestamp").first()


class Position(models.Model):
    """Lectura GPS enviada por el conductor (RF-06)."""
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name="positions")
    lat = models.FloatField()
    lng = models.FloatField()
    timestamp = models.DateTimeField()
    received_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-timestamp"]
        indexes = [models.Index(fields=["trip", "-timestamp"])]
