"""
This file defines the grading routes for the Flask application. It imports necessary modules and functions, creates a blueprint for grading-related routes, and defines a route handler for creating a new grading version. The route handler processes incoming requests, validates the input data, interacts with the grading version service to create a new grading version, and returns appropriate responses based on the outcome of the operation.
"""

from flask import Blueprint, request, jsonify
from app.services.grading_version import create_grading_version, get_active_version
from app.utils.auth_utils import role_required

grading_bp = Blueprint('grading', __name__)

@grading_bp.route('/version', methods=['POST'])
@role_required(['admin', 'teacher'])
def create_version():
    """
    This route handler creates a new grading version based on the data provided in the request body. It expects a JSON payload containing 'exam_weight' and 'assignment_weight'. The function validates the input, ensures that the weights sum to 1.0, deactivates any existing active grading version, and creates a new grading version. The response includes the details of the newly created grading version or an error message if validation fails.
    """
    data = request.get_json() # Get the JSON data from the request body

    result = create_grading_version(data) # Call the service function to create a new grading version

    # Service returns (error_dict, status_code) for validation failures,
    # and a GradingVersion instance on success.
    if isinstance(result, tuple):
        response, status_code = result
        return jsonify(response), status_code

    return jsonify(result.to_dict()), 201


@grading_bp.route('/version/active', methods=['GET'])
@role_required(['admin', 'teacher', 'student'])
def get_version():
    """Fetch the currently active grading version."""
    result = get_active_version()
    if isinstance(result, tuple):
        response, status_code = result
        return jsonify(response), status_code

    return jsonify(result.to_dict()), 200