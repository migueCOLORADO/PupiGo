from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from .models import InvalidTransition, Trip
from .serializers import PositionSerializer, TripSerializer


class TripViewSet(viewsets.ModelViewSet):
    """
    POST /api/trips/                  crear recorrido (En espera)        RF-04
    POST /api/trips/{id}/start/       En curso                           RF-05
    POST /api/trips/{id}/complete/    Completado                         RF-19
    POST /api/trips/{id}/cancel/      Cancelado                          RF-19b
    POST /api/trips/{id}/positions/   registrar lectura GPS              RF-06
    GET  /api/trips/active/           recorrido activo + ultima posicion RF-06/07
    """
    queryset = Trip.objects.select_related("route", "vehicle", "driver")
    serializer_class = TripSerializer
    http_method_names = ["get", "post", "head", "options"]

    def perform_create(self, serializer):
        if Trip.objects.filter(status__in=Trip.ACTIVE_STATUSES).exists():
            raise ValidationError("Ya existe un recorrido activo. Finalizalo o cancelalo primero.")
        serializer.save()

    def _transition(self, method):
        trip = self.get_object()
        try:
            method(trip)
        except InvalidTransition as e:
            return Response({"detail": str(e)}, status=status.HTTP_409_CONFLICT)
        return Response(self.get_serializer(trip).data)

    @action(detail=True, methods=["post"])
    def start(self, request, pk=None):
        return self._transition(Trip.start)

    @action(detail=True, methods=["post"])
    def complete(self, request, pk=None):
        return self._transition(Trip.complete)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        return self._transition(Trip.cancel)

    @action(detail=True, methods=["post"])
    def positions(self, request, pk=None):
        trip = self.get_object()
        if trip.status != Trip.IN_PROGRESS:
            return Response({"detail": "Solo se aceptan posiciones de un recorrido en curso."}, status=status.HTTP_409_CONFLICT)
        ser = PositionSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        ser.save(trip=trip)
        return Response(ser.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["get"])
    def active(self, request):
        trip = self.get_queryset().filter(status__in=Trip.ACTIVE_STATUSES).first()
        if trip is None:
            return Response(None)
        return Response(self.get_serializer(trip).data)
