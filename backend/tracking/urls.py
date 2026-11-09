from django.urls import path
from rest_framework.routers import DefaultRouter
from .assistant_views import AssistantView
from .auth_views import LoginView, LogoutView, MeView
from .views import TripViewSet

router = DefaultRouter()
router.register("trips", TripViewSet, basename="trip")
urlpatterns = router.urls + [
    path("assistant/", AssistantView.as_view()),
    path("auth/login/", LoginView.as_view()),
    path("auth/logout/", LogoutView.as_view()),
    path("auth/me/", MeView.as_view()),
]
