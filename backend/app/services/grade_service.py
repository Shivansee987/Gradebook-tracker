from app.extensions import db
from app.models.grade import Grade
from app.models.marks import Marks
from app.services.grading_version import get_active_version


def _score_to_letter(score):
    """Convert numeric score to a grade letter."""
    if score >= 90:
        return 'A'
    if score >= 80:
        return 'B'
    if score >= 70:
        return 'C'
    if score >= 60:
        return 'D'
    return 'F'

def calculate_and_store_grade(marks_id):

    """
    This function calculates the grade for a student based on their marks and the currently active grading version. It retrieves the marks using the provided marks_id, gets the active grading version, calculates the grade using the weights defined in the active grading version, and then stores the calculated grade in the database. The function returns a success message along with the stored grade details if successful, or an error message with an appropriate status code if any step fails (e.g., marks not found or no active grading version).

    args:
        marks_id (int): The unique identifier for the marks entry for which the grade needs to be calculated.
    
    returns:
        dict: A dictionary containing a success message and the grade details if the operation is successful, or an error message with a status code if any validation fails.
    """

    # get marks
    marks = Marks.query.filter_by(id=marks_id).first()
    if not marks:
        return {'error': 'Marks not found.'}, 404
    
    # get active grading version
    version = get_active_version()
    if isinstance(version, tuple): # check if get_active_version returned an error
        return version
    
    # calculate grade based on the active grading version
    grade_score = (
        marks.exam_marks * version.exam_weight + 
        marks.assignment_marks * version.assignment_weight
    )
    grade_value = _score_to_letter(grade_score)

    # store the grade
    grade = Grade(
        student_id=marks.student_id,
        subject_id=marks.subject_id,
        marks_id=marks.id,
        grade=grade_value,
        version_id=version.id
    )

    # Save the new grade to the database
    db.session.add(grade)
    db.session.flush()

    return {
        "message": "Grade calculated and stored successfully.",
        "grade": grade.to_dict()
    }, 201