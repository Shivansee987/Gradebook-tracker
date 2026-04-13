from functools import wraps # This import is necessary for creating decorators in Python

from flask_jwt_extended import get_jwt, get_jwt_identity, verify_jwt_in_request # These imports are necessary for working with JWTs in Flask

def role_required(required_role):
    """
    This function is a decorator that can be used to protect routes in a Flask application by requiring a specific user role for access. It verifies that a valid JWT is present in the request, retrieves the user's identity from the JWT, checks if the user's role matches the required role, and either allows access to the route or returns an appropriate error response if the user is unauthorized or has insufficient permissions.
    """

    def wrapper(fn):
        """
        This inner function is the actual decorator that wraps the original function (route handler) and performs the role-based access control logic. It uses the @wraps decorator to preserve the original function's metadata and defines a new function (decorator) that will be executed when the decorated route is accessed.
        """
        @wraps(fn)
        
        def decorator(*args, **kwargs):
            """ 
            This function is the decorator that will be executed when the decorated route is accessed. It verifies the JWT, retrieves the user's identity and role, checks if the user has the required role, and either allows access to the route or returns an error response. 

            args: The positional arguments passed to the decorated function (route handler).
            kwargs: The keyword arguments passed to the decorated function (route handler).

            Returns:
            The result of the decorated function if the user has the required role, or an error response if the user is unauthorized or has insufficient permissions.
            """
            verify_jwt_in_request() # Verify that a valid JWT is present in the request

            user_identity = get_jwt_identity() # Get the identity of the currently authenticated user from the JWT
            claims = get_jwt() # Get all JWT claims (including additional_claims)

            if not user_identity:
                return {'error': 'Unauthorized access. No user identity found.'}, 401

            # Support both identity formats:
            # 1) dict identity: {'id': '...', 'role': '...'}
            # 2) string identity with role in additional_claims
            user_role = claims.get('role')
            if not user_role and isinstance(user_identity, dict):
                user_role = user_identity.get('role')

            if user_role != required_role:
                return {'error': 'Forbidden access. Insufficient permissions.'}, 403
            
            return fn(*args, **kwargs) # If the user has the required role, proceed to execute the decorated function
        return decorator
    return wrapper