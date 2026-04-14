from app.extensions import db
from app.models.audit_log import AuditLog

def log_action(action_type, table_name, record_id, old_value, new_value, changed_by, commit=True):
    """
    This function creates a new audit log entry in the database to record changes made to records in the application. It takes parameters such as the type of action performed (e.g., "create", "update", "delete"), the name of the table affected, the unique identifier of the record affected, the old value of the record before the change (if applicable), the new value of the record after the change (if applicable), and the unique identifier of the user who made the change. The function creates a new instance of the AuditLog model with these details, saves it to the database, and returns a response indicating that the audit log entry was created successfully.
    """
    audit_log = AuditLog(
        action_type=action_type,
        table_name=table_name,
        record_id=record_id,
        old_value=old_value,
        new_value=new_value,
        changed_by=changed_by
    )

    db.session.add(audit_log)
    db.session.flush()
    if commit:
        db.session.commit()

    return {
        "message": "Audit log entry created successfully.",
        "audit_log": audit_log.to_dict()
    }, 201


def get_audit_logs(page=1, per_page=50, table_name=None, action_type=None):
    """Return paginated audit logs for admin monitoring screens."""
    page = max(1, int(page))
    per_page = max(1, min(int(per_page), 200))

    query = AuditLog.query

    if table_name:
        query = query.filter(AuditLog.table_name == table_name)
    if action_type:
        query = query.filter(AuditLog.action_type == action_type)

    query = query.order_by(AuditLog.timestamp.desc())
    total = query.count()
    rows = query.offset((page - 1) * per_page).limit(per_page).all()

    return {
        "items": [row.to_dict() for row in rows],
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": total,
            "pages": (total + per_page - 1) // per_page,
        },
    }