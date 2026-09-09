from django.contrib import admin
from .models import Driver, Position, Route, Trip, Vehicle

admin.site.register([Route, Vehicle, Driver, Position])


@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = ("id", "direction", "status", "driver", "vehicle", "created_at", "started_at", "ended_at")
    list_filter = ("status", "direction")
