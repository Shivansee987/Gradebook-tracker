from flask import Blueprint, jsonify, request

from app.services.subject_service import create_subject, get_subjects
from app.utils.auth_utils import role_required


subject_bp = Blueprint("subjects", __name__)


@subject_bp.route("/subjects", methods=["GET"])
@subject_bp.route("/api/subjects", methods=["GET"])
@role_required(["admin", "teacher", "student"])
def list_subjects():
    page = request.args.get("page", default=1, type=int)
    per_page = request.args.get("per_page", default=100, type=int)

    data = get_subjects(page=page, per_page=per_page)
    return jsonify(data), 200


@subject_bp.route("/subjects", methods=["POST"])
@subject_bp.route("/api/subjects", methods=["POST"])
@role_required(["admin", "teacher"])
def add_subject():
    data = request.get_json()
    result, status_code = create_subject(data)
    return jsonify(result), status_code
