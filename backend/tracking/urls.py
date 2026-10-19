from django.urls import path
from rest_framework.routers import DefaultRouter
from .assistant_views import AssistantView
from .views import TripViewSet

router = DefaultRouter()
router.register("trips", TripViewSet, basename="trip")
urlpatterns = router.urls + [path("assistant/", AssistantView.as_view())]
