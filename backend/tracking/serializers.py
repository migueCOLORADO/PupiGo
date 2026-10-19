from django.conf import settings
from rest_framework import serializers
from .models import Driver, Position, Route, Stop, Trip, Vehicle



class StopSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stop
        fields = ["id", "name", "lat", "lng", "order"]


class RouteSerializer(serializers.ModelSerializer):
    stops = StopSerializer(many=True, read_only=True)

    class Meta:
        model = Route
        fields = "__all__"


class PositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Position
        fields = ["id", "lat", "lng", "timestamp", "received_at"]
        read_only_fields = ["id", "received_at"]

    # UH4: solo se reemplaza la ultima posicion conocida si la nueva es valida.
    # (nan/inf tambien fallan esta comparacion)
    def validate_lat(self, value):
        if not -90 <= value <= 90:
            raise serializers.ValidationError("Latitud fuera de rango (-90 a 90).")
        return value

    def validate_lng(self, value):
        if not -180 <= value <= 180:
            raise serializers.ValidationError("Longitud fuera de rango (-180 a 180).")
        return value


class TripSerializer(serializers.ModelSerializer):
    route = RouteSerializer(read_only=True)
    route_id = serializers.PrimaryKeyRelatedField(source="route", queryset=Route.objects.all(), write_only=True, required=False)
    vehicle_id = serializers.PrimaryKeyRelatedField(source="vehicle", queryset=Vehicle.objects.all(), write_only=True, required=False)
    driver_id = serializers.PrimaryKeyRelatedField(source="driver", queryset=Driver.objects.all(), write_only=True, required=False)
    vehicle = serializers.StringRelatedField(read_only=True)
    driver = serializers.StringRelatedField(read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    last_position = PositionSerializer(read_only=True)
    gps_max_interval_seconds = serializers.SerializerMethodField()
    position_age_seconds = serializers.SerializerMethodField()

    class Meta:
        model = Trip
        fields = [
            "id", "route", "route_id", "vehicle", "vehicle_id", "driver", "driver_id",
            "direction", "status", "status_display", "waiting_minutes",
            "created_at", "started_at", "ended_at", "last_position", "gps_max_interval_seconds",
            "position_age_seconds",
        ]
        read_only_fields = ["status", "created_at", "started_at", "ended_at"]

    def get_gps_max_interval_seconds(self, obj):
        return settings.GPS_MAX_INTERVAL_SECONDS

    def get_position_age_seconds(self, obj):
        # UH4: el cliente compara contra gps_max_interval_seconds para marcar "desactualizada"
        return obj.position_age_seconds

    def create(self, validated):
        # Defaults al primer registro sembrado (ruta fija Sprint 2)
        validated.setdefault("route", Route.objects.first())
        validated.setdefault("vehicle", Vehicle.objects.first())
        validated.setdefault("driver", Driver.objects.first())
        missing = [k for k in ("route", "vehicle", "driver") if validated[k] is None]
        if missing:
            raise serializers.ValidationError("Faltan datos base (%s). Ejecuta: manage.py seed" % ", ".join(missing))
        return super().create(validated)