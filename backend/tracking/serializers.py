from django.conf import settings
from rest_framework import serializers
from .models import Driver, Position, Route, Stop, Trip, Vehicle



class StopSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stop
        fields = ["id", "name", "lat", "lng", "order"]


class RouteSerializer(serializers.ModelSerializer):
    stops = serializers.SerializerMethodField()

    class Meta:
        model = Route
        fields = "__all__"

    def get_stops(self, obj):
        # UH14: una parada desactivada deja de publicarse para recorridos nuevos,
        # pero la fila se conserva en BD (no se borra el historico).
        return StopSerializer(obj.stops.filter(is_active=True), many=True).data


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

    # UH14 / RF-45: un recorrido nuevo solo puede usar registros activos.
    # (campo en validated_data, etiqueta para el mensaje, modelo)
    REQUIRED_RECORDS = (
        ("route", "ruta", Route),
        ("vehicle", "vehiculo", Vehicle),
        ("driver", "conductor", Driver),
    )

    def create(self, validated):
        errors, falta_alguno = [], False
        for field, label, model in self.REQUIRED_RECORDS:
            chosen = validated.get(field)
            if chosen is None:
                # Sin seleccion explicita se usa el primer registro activo (ruta fija Sprint 2)
                chosen = model.objects.filter(is_active=True).order_by("id").first()
                if chosen is None:
                    errors.append("falta un registro de %s activo" % label)
                    falta_alguno = True
                    continue
                validated[field] = chosen
            elif not chosen.is_active:
                # RF-45: el registro existe pero el administrador lo desactivo (UH14)
                errors.append("el registro de %s '%s' esta desactivado" % (label, chosen))
        if errors:
            detail = "No se puede crear el recorrido: %s." % "; ".join(errors)
            if falta_alguno:
                detail += " Ejecuta: manage.py seed"
            raise serializers.ValidationError({"detail": detail})
        return super().create(validated)

