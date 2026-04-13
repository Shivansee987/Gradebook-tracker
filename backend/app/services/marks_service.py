from app.extensions import db
from app.models.marks import Marks
from app.models.subject import Subject
from app.models.user import User
from app.services.grade_service import calculate_and_store_grade
from app.services.audit_service import log_action
from app.utils.auth_utils import get_current_user_id

def create_marks(data):

    """
    This function creates a new marks entry for a student in a specific subject based on the provided data. It validates the input data to ensure that all required fields are present, creates a new Marks instance, saves it to the database, and then calls the calculate_and_store_grade function to compute and store the corresponding grade based on the newly created marks entry. The function returns a response containing the created marks and the calculated grade details if successful, or an error message with an appropriate status code if any validation fails.
    """

    if not isinstance(data, dict):
        return {'error': 'Invalid JSON payload.'}, 400

    # retrieve the data from the request
    student_id = data.get('student_id')
    subject_id = data.get('subject_id')
    exam_marks = data.get('exam_marks')
    assignment_marks = data.get('assignment_marks')

    # basic validation
    if student_id is None or subject_id is None or exam_marks is None or assignment_marks is None:
        return {'error': 'All fields are required.'}, 400

    try:
        exam_marks = float(exam_marks)
        assignment_marks = float(assignment_marks)
    except (TypeError, ValueError):
        return {'error': 'exam_marks and assignment_marks must be numeric.'}, 400

    if exam_marks < 0 or exam_marks > 100 or assignment_marks < 0 or assignment_marks > 100:
        return {'error': 'Marks must be between 0 and 100.'}, 400

    student = User.query.filter_by(unique_id=student_id).first()
    if not student:
        return {'error': 'Student not found.'}, 404
    if student.role != 'student':
        return {'error': 'student_id must belong to a student user.'}, 400

    subject = Subject.query.filter_by(id=subject_id).first()
    if not subject:
        return {'error': 'Subject not found.'}, 404
    
    # write marks, grade, and audit log in one transaction to prevent partial state.
    try:
        marks = Marks(
            student_id=student_id,
            subject_id=subject_id,
            exam_marks=exam_marks,
            assignment_marks=assignment_marks
        )
        db.session.add(marks)
        db.session.flush()

        grade_response, grade_status = calculate_and_store_grade(marks.id)
        if grade_status != 201:
            db.session.rollback()
            return grade_response, grade_status

        user_id = get_current_user_id()
        if user_id:
            log_action(
                action_type="create",
                table_name="marks",
                record_id=marks.id,
                old_value=None,
                new_value=marks.to_dict(),
                changed_by=user_id,
                commit=False
            )

        db.session.commit()
    except Exception:
        db.session.rollback()
        return {'error': 'Failed to create marks.'}, 500

    # Return the response with the created marks and the calculated grade (if successful)
    return {
        "message": "Marks created successfully.",
        "marks": marks.to_dict(),
        "grade": grade_response.get('grade') if grade_status == 201 else None,
    }, 201 if grade_status == 201 else grade_status