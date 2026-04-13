"""
This file defines the grading version service for the Flask application. It contains functions to create a new grading version and to retrieve the currently active grading version. The create_grading_version function validates the input weights for exams and assignments, ensures they sum to 1.0, deactivates any existing active grading version, and creates a new one. The get_active_version function retrieves the currently active grading version from the database. Both functions return appropriate responses based on the success or failure of their operations.
"""

from app.extensions import db
from app.models.grading_version import GradingVersion

def create_grading_version(data):
    """
    This function creates a new grading version based on the provided data. It validates the input weights for exams and assignments, ensures that they sum to 1.0, deactivates any existing active grading version, and then creates and saves the new grading version to the database. The function returns the newly created grading version instance.

    args:
        data (dict): A dictionary containing the 'exam_weight' and 'assignment_weight' for the new grading version.

    returns:
        GradingVersion: The newly created grading version instance if successful, or an error message with a 400 status code if validation fails.
    """
    exam_weight = data.get('exam_weight')

    assignment_weight = data.get('assignment_weight')

    # basic validation
    if exam_weight is None or assignment_weight is None:
        return {'error': 'Both exam_weight and assignment_weight are required.'}, 400
    
    if exam_weight + assignment_weight != 1.0:
        return {'error': 'Weight must sum to 1.0.'}, 400
    
    # Deactivate existing active grading versions
    old_active = GradingVersion.query.filter_by(is_active=True).first()
    if old_active:
        old_active.is_active = False
        db.session.commit()
    
    # Create new grading version
    new_version = GradingVersion(
        exam_weight=exam_weight,
        assignment_weight=assignment_weight,
        is_active=True
    )

    # Save the new grading version to the database
    db.session.add(new_version)
    db.session.commit()
    return new_version


def get_active_version():
    """
    This function retrieves the currently active grading version from the database. It queries for the grading version where 'is_active' is True and returns it. If no active grading version is found, it returns an error message with a 404 status code.
    """

    version = GradingVersion.query.filter_by(is_active=True).first()

    if not version:
        return {'error': 'No active grading version found.'}, 404
    
    return version
