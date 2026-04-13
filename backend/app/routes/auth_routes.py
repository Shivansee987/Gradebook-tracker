from flask import Blueprint, request, jsonify # this import is necessary for creating a blueprint and handling requests and responses

from app.services.auth_service import create_user # this import is necessary for using the create_user function from the auth_service module

auth_bp = Blueprint('auth', __name__) # Create a blueprint for authentication routes

@auth_bp.route('/register', methods=['POST']) # Define a route for user registration that accepts POST requests
def signup():
    """
    This function handles the user registration process. It receives user data from the request, calls the create_user function to create a new user in the database, and returns the appropriate response based on the outcome of the registration process.
    """
    data = request.get_json() # Get the JSON data from the request

    result, status_code = create_user(data) # Call the create_user function with the received data and get the result and status code
    
    return jsonify(result), status_code # Return the result as a JSON response with the appropriate status code