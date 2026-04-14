"""
This file defines the grading version service for the Flask application. It contains functions to create a new grading version and to retrieve the currently active grading version. The create_grading_version function validates the input weights for exams and assignments, ensures they sum to 1.0, deactivates any existing active grading version, and creates a new one. The get_active_version function retrieves the currently active grading version from the database. Both functions return appropriate responses based on the success or failure of their operations.
"""

from app.extensions import db
from app.models.grading_version import GradingVersion
from app.services.audit_service import log_action
from app.utils.auth_utils import get_current_user_id

EPSILON = 1e-6

def create_grading_version(data):
    """
    This function creates a new grading version based on the provided data. It validates the input weights for exams and assignments, ensures that they sum to 1.0, deactivates any existing active grading version, and then creates and saves the new grading version to the database. The function returns the newly created grading version instance.

    args:
        data (dict): A dictionary containing the 'exam_weight' and 'assignment_weight' for the new grading version.

    returns:
        GradingVersion: The newly created grading version instance if successful, or an error message with a 400 status code if validation fails.
    """
    if not isinstance(data, dict):
        return {'error': 'Invalid JSON payload.'}, 400

    exam_weight = data.get('exam_weight')
    assignment_weight = data.get('assignment_weight')

    # basic validation
    if exam_weight is None or assignment_weight is None:
        return {'error': 'Both exam_weight and assignment_weight are required.'}, 400
    
    try:
        exam_weight = float(exam_weight)
        assignment_weight = float(assignment_weight)
    except (TypeError, ValueError):
        return {'error': 'Weights must be numeric values.'}, 400

    if exam_weight < 0 or assignment_weight < 0:
        return {'error': 'Weights must be non-negative.'}, 400

    if abs((exam_weight + assignment_weight) - 1.0) > EPSILON:
        return {'error': 'Weight must sum to 1.0.'}, 400

    try:
        previous_active = GradingVersion.query.filter_by(is_active=True).first()

        # Deactivate all active versions before creating the new active one.
        GradingVersion.query.filter_by(is_active=True).update({'is_active': False})

        new_version = GradingVersion(
            exam_weight=exam_weight,
            assignment_weight=assignment_weight,
            is_active=True
        )
        db.session.add(new_version)

        # Flush before audit so IDs/defaults are available for serialized snapshots.
        db.session.flush()

        user_id = get_current_user_id()
        if user_id:
            log_action(
                action_type='create',
                table_name='grading_versions',
                record_id=new_version.id,
                old_value=previous_active.to_dict() if previous_active else None,
                new_value=new_version.to_dict(),
                changed_by=user_id,
                commit=False
            )

        db.session.commit()
    except Exception:
        db.session.rollback()
        return {'error': 'Failed to create grading version.'}, 500

    return new_version


def get_active_version():
    """
    This function retrieves the currently active grading version from the database. It queries for the grading version where 'is_active' is True and returns it. If no active grading version is found, it returns an error message with a 404 status code.
    """

    version = GradingVersion.query.filter_by(is_active=True).first()

    if not version:
        return {'error': 'No active grading version found.'}, 404
    
    return version
