from app.models.grade import Grade
from app.models.grading_version import GradingVersion
from app.models.marks import Marks


def get_student_report(student_id):
    """Return a student report with marks and latest computed grade per marks row."""
    marks_list = Marks.query.filter_by(student_id=student_id).order_by(Marks.created_at.desc()).all()

    report = []
    for marks in marks_list:
        grade = (
            Grade.query.filter_by(marks_id=marks.id)
            .order_by(Grade.created_at.desc())
            .first()
        )

        version = None
        if grade:
            version = GradingVersion.query.filter_by(id=grade.version_id).first()

        report.append(
            {
                "subject_id": marks.subject_id,
                "exam_marks": marks.exam_marks,
                "assignment_marks": marks.assignment_marks,
                "grade": grade.grade if grade else None,
                "grading_version_id": version.id if version else None,
            }
        )

    return report


def get_all_marks_report(page=1, per_page=20):
    """Return paginated marks with latest grade for teacher/admin reporting."""
    page = max(1, int(page))
    per_page = max(1, min(int(per_page), 100))

    query = Marks.query.order_by(Marks.created_at.desc())
    total = query.count()
    marks_list = query.offset((page - 1) * per_page).limit(per_page).all()

    result = []
    for mark in marks_list:
        grade = (
            Grade.query.filter_by(marks_id=mark.id)
            .order_by(Grade.created_at.desc())
            .first()
        )
        result.append(
            {
                "student_id": mark.student_id,
                "subject_id": mark.subject_id,
                "exam_marks": mark.exam_marks,
                "assignment_marks": mark.assignment_marks,
                "grade": grade.grade if grade else None,
            }
        )

    return {
        "items": result,
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": total,
            "pages": (total + per_page - 1) // per_page,
        },
    }
