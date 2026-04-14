from flask import Blueprint, jsonify, request

from app.services.report_service import get_student_report
from app.services.student_service import get_registered_students, get_student_profile
from app.utils.auth_utils import get_current_user_id, role_required


student_bp = Blueprint("students", __name__)


@student_bp.route("/students/registered", methods=["GET"])
@student_bp.route("/api/students/registered", methods=["GET"])
@role_required(["admin", "teacher"])
def registered_students():
    """Return a paginated list of registered students for teacher/admin use."""
    page = request.args.get("page", default=1, type=int)
    per_page = request.args.get("per_page", default=50, type=int)

    data = get_registered_students(page=page, per_page=per_page)
    return jsonify(data), 200


@student_bp.route("/students/me", methods=["GET"])
@student_bp.route("/api/students/me", methods=["GET"])
@role_required(["student"])
def current_student_profile():
    """Return currently logged-in student's profile."""
    user_id = get_current_user_id()
    result, status_code = get_student_profile(user_id)
    return jsonify(result), status_code


@student_bp.route("/students/me/report", methods=["GET"])
@student_bp.route("/api/students/me/report", methods=["GET"])
@role_required(["student"])
def current_student_report():
    """Return currently logged-in student's report without client-supplied ID."""
    user_id = get_current_user_id()
    data = get_student_report(user_id)
    return jsonify(data), 200
