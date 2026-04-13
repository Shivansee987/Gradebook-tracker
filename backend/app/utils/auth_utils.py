from functools import wraps

from flask_jwt_extended import get_jwt, get_jwt_identity, verify_jwt_in_request


def get_current_user_id():
    """Return the authenticated user id from JWT identity."""
    verify_jwt_in_request()
    user_identity = get_jwt_identity()

    # Support both identity payload styles used by JWT.
    if isinstance(user_identity, dict):
        return user_identity.get("id") or user_identity.get("unique_id")
    return str(user_identity) if user_identity else None


def get_current_user_role():
    """Return the authenticated user's role from claims or identity."""
    verify_jwt_in_request()
    claims = get_jwt()
    user_identity = get_jwt_identity()

    role = claims.get("role")
    if role:
        return role

    if isinstance(user_identity, dict):
        return user_identity.get("role")
    return None


def role_required(required_roles):
    """Protect routes using one role or a list of roles."""
    if isinstance(required_roles, str):
        allowed_roles = {required_roles}
    else:
        allowed_roles = set(required_roles)

    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            user_id = get_current_user_id()
            if not user_id:
                return {"error": "Unauthorized access. No user identity found."}, 401

            user_role = get_current_user_role()
            if user_role not in allowed_roles:
                return {"error": "Forbidden access. Insufficient permissions."}, 403

            return fn(*args, **kwargs)

        return decorator

    return wrapper