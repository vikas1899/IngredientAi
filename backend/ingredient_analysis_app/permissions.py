from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Permission class that grants full access to the object owner,
    but only read-only access to other users.
    """

    def has_object_permission(self, request, view, obj):
        # SAFE_METHODS include GET, HEAD, and OPTIONS — allow these for any user
        if request.method in permissions.SAFE_METHODS:
            return True

        # Only the owner of the object can perform write operations (POST, PUT, PATCH, DELETE)
        return obj.user == request.user


class IsOwner(permissions.BasePermission):
    """
    Permission class that restricts all access to the object owner only.
    """

    def has_object_permission(self, request, view, obj):
        # Grant permission only if the requesting user is the owner
        return obj.user == request.user
