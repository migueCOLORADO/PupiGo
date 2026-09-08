from django.conf import settings
from rest_framework import serializers
from .models import Driver, Position, Route, Trip, Vehicle


class RouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Route
        fields = "__all__"


class PositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Position
        fields = ["id", "lat", "lng", "timestamp", "received_at"]
        read_only_fields = ["id", "received_at"]


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

    class Meta:
        model = Trip
        fields = [
            "id", "route", "route_id", "vehicle", "vehicle_id", "driver", "driver_id",
            "direction", "status", "status_display", "waiting_minutes",
            "created_at", "started_at", "ended_at", "last_position", "gps_max_interval_seconds",
        ]
        read_only_fields = ["status", "created_at", "started_at", "ended_at"]

    def get_gps_max_interval_seconds(self, obj):
        return settings.GPS_MAX_INTERVAL_SECONDS

    def create(self, validated):
        # Defaults al primer registro sembrado (ruta fija Sprint 2)
        validated.setdefault("route", Route.objects.first())
        validated.setdefault("vehicle", Vehicle.objects.first())
        validated.setdefault("driver", Driver.objects.first())
        missing = [k for k in ("route", "vehicle", "driver") if validated[k] is None]
        if missing:
            raise serializers.ValidationError("Faltan datos base (%s). Ejecuta: manage.py seed" % ", ".join(missing))
        return super().create(validated)
