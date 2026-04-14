from flask import Blueprint, jsonify, request

from app.services.subject_service import (
    create_subject,
    delete_subject,
    get_subjects,
    update_subject,
)
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


@subject_bp.route("/subjects/<subject_id>", methods=["PUT"])
@subject_bp.route("/api/subjects/<subject_id>", methods=["PUT"])
@role_required(["admin", "teacher"])
def edit_subject(subject_id):
    data = request.get_json()
    result, status_code = update_subject(subject_id, data)
    return jsonify(result), status_code


@subject_bp.route("/subjects/<subject_id>", methods=["DELETE"])
@subject_bp.route("/api/subjects/<subject_id>", methods=["DELETE"])
@role_required(["admin", "teacher"])
def remove_subject(subject_id):
    result, status_code = delete_subject(subject_id)
    return jsonify(result), status_code
