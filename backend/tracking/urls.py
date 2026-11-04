from django.urls import path
from rest_framework.routers import DefaultRouter
from .assistant_views import AssistantView
from .views import TripViewSet, TripEventViewSet, StopViewSet

router = DefaultRouter()
router.register("trips", TripViewSet, basename="trip")
router.register("trip-events", TripEventViewSet, basename="trip-event")
router.register("stops", StopViewSet, basename="stop")
urlpatterns = router.urls + [path("assistant/", AssistantView.as_view())]
