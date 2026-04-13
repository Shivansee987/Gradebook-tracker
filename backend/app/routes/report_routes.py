from flask import Blueprint, jsonify
from app.services.report_service import get_student_report
from app.utils.auth_utils import role_required
from backend.app.models.grade import Grade
from backend.app.models.marks import Marks

report_bp = Blueprint("report", __name__, url_prefix="/api/report")

@report_bp.route("/student/<student_id>", methods=["GET"])
@role_required("student")
def student_report(student_id):
    data = get_student_report(student_id)
    return jsonify(data), 200


@report_bp.route("/teacher/all-marks", methods=["GET"])
@role_required(["admin", "teacher"])
def get_all_marks():
    marks_list = Marks.query.all()

    result = []

    for mark in marks_list:
        grade = Grade.query.filter_by(marks_id=mark.id).order_by(Grade.created_at.desc()).first()

        result.append({
            "student_id": mark.student_id,
            "subject_id": mark.subject_id,
            "exam_marks": mark.exam_marks,
            "assignment_marks": mark.assignment_marks,
            "grade": grade.grade if grade else None
        })

    return result