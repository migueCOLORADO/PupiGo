from rest_framework.permissions import BasePermission

ROLE_CONDUCTOR = "conductor"
ROLE_ESTUDIANTE = "estudiante"
ROLES = (ROLE_CONDUCTOR, ROLE_ESTUDIANTE)


def role_of(user):
    """Devuelve "conductor", "estudiante" o None segun los grupos del usuario."""
    if user is None or not user.is_authenticated:
        return None
    names = set(user.groups.values_list("name", flat=True))
    for role in ROLES:
        if role in names:
            return role
    return None


class IsDriver(BasePermission):
    """RF #132: solo usuarios autenticados del grupo conductor."""
    message = "Esta accion es solo para conductores."

    def has_permission(self, request, view):
        return role_of(request.user) == ROLE_CONDUCTOR
