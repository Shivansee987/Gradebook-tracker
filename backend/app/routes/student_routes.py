from flask import Blueprint, jsonify, request

from app.services.student_service import get_registered_students
from app.utils.auth_utils import role_required


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
