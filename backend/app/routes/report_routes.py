from flask import Blueprint, jsonify, request
from app.services.report_service import get_all_marks_report, get_student_report
from app.utils.auth_utils import get_current_user_id, get_current_user_role, role_required

report_bp = Blueprint("report", __name__)

@report_bp.route("/report/student/<student_id>", methods=["GET"])
@report_bp.route("/api/report/student/<student_id>", methods=["GET"])
@role_required(["admin", "teacher", "student"])
def student_report(student_id):
    # Students can only view their own report; elevated roles can view any student.
    current_user_id = get_current_user_id()
    current_role = get_current_user_role()
    if current_role == "student" and current_user_id != student_id:
        return jsonify({"error": "Forbidden access. Insufficient permissions."}), 403

    data = get_student_report(student_id)
    return jsonify(data), 200


@report_bp.route("/report/teacher/all-marks", methods=["GET"])
@report_bp.route("/api/report/teacher/all-marks", methods=["GET"])
@role_required(["admin", "teacher"])
def get_all_marks():
    page = request.args.get("page", default=1, type=int)
    per_page = request.args.get("per_page", default=20, type=int)

    data = get_all_marks_report(page=page, per_page=per_page)
    return jsonify(data), 200