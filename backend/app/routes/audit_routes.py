from flask import Blueprint, jsonify, request

from app.services.audit_service import get_audit_logs
from app.utils.auth_utils import role_required


audit_bp = Blueprint("audit", __name__)


@audit_bp.route("/audit/logs", methods=["GET"])
@audit_bp.route("/api/audit/logs", methods=["GET"])
@role_required(["admin"])
def list_audit_logs():
    """Admin endpoint to inspect audit history across write operations."""
    page = request.args.get("page", default=1, type=int)
    per_page = request.args.get("per_page", default=50, type=int)
    table_name = request.args.get("table_name", default=None, type=str)
    action_type = request.args.get("action_type", default=None, type=str)

    data = get_audit_logs(
        page=page,
        per_page=per_page,
        table_name=table_name,
        action_type=action_type,
    )
    return jsonify(data), 200
