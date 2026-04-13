from flask import Blueprint, request, jsonify
from app.services.marks_service import create_marks
from app.utils.auth_utils import role_required

marks_bp = Blueprint('marks', __name__)

@marks_bp.route('/add-marks', methods=['POST'])
#@role_required(['admin', 'teacher']) # Only allow users with 'admin' or 'teacher' roles to access this route

def add_marks():
    """
    This route handler allows authorized users (admin and teacher) to add marks for a student in a specific subject. It receives the marks data from the request body, calls the create_marks function from the marks service to create a new marks entry, and returns the appropriate response based on the outcome of the operation.
    """
    data = request.get_json() # Get the JSON data from the request body

    result, status_code = create_marks(data) # Call the create_marks function with the received data and get the result and status code

    return jsonify(result), status_code # Return the result as a JSON response with the appropriate status code