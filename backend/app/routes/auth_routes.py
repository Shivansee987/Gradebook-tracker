"""
This file defines the authentication routes for the Flask application. It creates a blueprint for authentication-related endpoints and defines two routes: one for user registration (/register) and another for user login (/login). Each route handles POST requests, processes the incoming data, and calls the appropriate service functions to perform the necessary operations (creating a user or logging in a user). The results are returned as JSON responses with the corresponding HTTP status codes.
"""


from flask import Blueprint, request, jsonify # this import is necessary for creating a blueprint and handling requests and responses

from app.services.auth_service import create_user, login_user # this import is necessary for using the create_user and login_user functions from the auth_service module

auth_bp = Blueprint('auth', __name__) # Create a blueprint for authentication routes

@auth_bp.route('/register', methods=['POST']) # Define a route for user registration that accepts POST requests
def signup():
    """
    This function handles the user registration process. It receives user data from the request, calls the create_user function to create a new user in the database, and returns the appropriate response based on the outcome of the registration process.
    """
    data = request.get_json() # Get the JSON data from the request

    result, status_code = create_user(data) # Call the create_user function with the received data and get the result and status code

    return jsonify(result), status_code # Return the result as a JSON response with the appropriate status code


@auth_bp.route('/login', methods=['POST']) # Define a route for user login that accepts POST requests
def signin():
    """
    This function handles the user login process. It receives user credentials from the request, calls the login_user function to authenticate the user, and returns the appropriate response based on the outcome of the login process.
    """
    data = request.get_json() # Get the JSON data from the request

    result, status_code = login_user(data) # Call the login_user function with the received data and get the result and status code

    return jsonify(result), status_code # Return the result as a JSON response with the appropriate status code