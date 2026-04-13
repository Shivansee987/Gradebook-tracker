from app.extensions import db
from app.models.marks import Marks
from app.services.grade_service import calculate_and_store_grade

def create_marks(data):

    """
    This function creates a new marks entry for a student in a specific subject based on the provided data. It validates the input data to ensure that all required fields are present, creates a new Marks instance, saves it to the database, and then calls the calculate_and_store_grade function to compute and store the corresponding grade based on the newly created marks entry. The function returns a response containing the created marks and the calculated grade details if successful, or an error message with an appropriate status code if any validation fails.
    """

    # retrieve the data from the request
    student_id = data.get('student_id')
    subject_id = data.get('subject_id')
    exam_marks = data.get('exam_marks')
    assignment_marks = data.get('assignment_marks')

    # basic validation
    if not all([student_id, subject_id, exam_marks, assignment_marks]):
        return {'error': 'All fields are required.'}, 400
    
    # create new marks entry
    marks = Marks(
        student_id=student_id,
        subject_id=subject_id,
        exam_marks=exam_marks,
        assignment_marks=assignment_marks
    )

    # Save the new marks entry to the database
    db.session.add(marks)
    db.session.commit()

    grade_response, grade_status = calculate_and_store_grade(marks.id) # calculate and store the grade based on the newly created marks entry

    # Return the response with the created marks and the calculated grade (if successful)
    return {
        "message": "Marks created successfully.",
        "marks": marks.to_dict(),
        "grade": grade_response.get('grade') if grade_status == 201 else None,
    }, 201 if grade_status == 201 else grade_status