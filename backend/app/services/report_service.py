from app.models.marks import Marks
from app.models.grade import Grade
from app.models.grading_version import GradingVersion

def generate_student_report(student_id):

    marks_list = Marks.query.filter_by(student_id=student_id).all() # retrieve all marks entries for the specified student

    # retrieve the corresponding grade entries for each marks entry and compile the report data
    report = []

    for marks in marks_list:
        grade = Grade.query.filter_by(marks_id=marks.id).first() # retrieve the grade entry corresponding to the current marks entry

        version = GradingVersion.query.filter_by(id=grade.version_id).first() # retrieve the grading version used for the current grade entry

        report.append({
            "subject_id": marks.subject_id,
            "exam_marks": marks.exam_marks,
            "assignment_marks": marks.assignment_marks,
            "grade": grade.grade,
            "grading_version": version.name if version else None
        })

    return report