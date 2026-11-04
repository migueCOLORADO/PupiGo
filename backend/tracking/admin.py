from django.contrib import admin
from .models import Driver, Position, Route, Stop, Trip, Vehicle


# UH14: el administrador (superusuario de Django Admin) crea, edita y desactiva
# rutas con paradas, vehiculos y conductores. Desactivar no borra el registro:
# deja de estar disponible para recorridos nuevos (RF-45) y el historico se
# conserva porque Trip referencia estas tablas con on_delete=PROTECT.
@admin.action(description="Desactivar seleccionados")
def desactivar(modeladmin, request, queryset):
    actualizados = queryset.update(is_active=False)
    modeladmin.message_user(request, "%s registro(s) desactivado(s)." % actualizados)


@admin.action(description="Activar seleccionados")
def activar(modeladmin, request, queryset):
    actualizados = queryset.update(is_active=True)
    modeladmin.message_user(request, "%s registro(s) activado(s)." % actualizados)


class StopInline(admin.TabularInline):
    """RF-44: las paradas se gestionan dentro de su ruta, en la misma pantalla."""
    model = Stop
    extra = 1
    fields = ("order", "name", "lat", "lng", "is_active")


@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display = ("name", "origin_name", "destination_name", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name", "origin_name", "destination_name")
    inlines = [StopInline]
    actions = [desactivar, activar]


@admin.register(Stop)
class StopAdmin(admin.ModelAdmin):
    list_display = ("name", "route", "order", "is_active")
    list_filter = ("is_active", "route")
    search_fields = ("name",)
    actions = [desactivar, activar]


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ("plate", "name", "is_active")
    list_filter = ("is_active",)
    search_fields = ("plate", "name")
    actions = [desactivar, activar]


@admin.register(Driver)
class DriverAdmin(admin.ModelAdmin):
    list_display = ("name", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name",)
    actions = [desactivar, activar]


admin.site.register(Position)


@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = ("id", "direction", "status", "driver", "vehicle", "created_at", "started_at", "ended_at")
    list_filter = ("status", "direction")

