from app.extensions import db
from app.models.subject import Subject
from app.services.audit_service import log_action
from app.utils.auth_utils import get_current_user_id
from sqlalchemy.exc import IntegrityError


def create_subject(data):
    """Create a subject with unique subject_code and required subject_name."""
    if not isinstance(data, dict):
        return {"error": "Invalid JSON payload."}, 400

    subject_code = data.get("subject_code")
    subject_name = data.get("subject_name")

    if isinstance(subject_code, str):
        subject_code = subject_code.strip().upper()
    if isinstance(subject_name, str):
        subject_name = subject_name.strip()

    if not subject_code or not subject_name:
        return {"error": "subject_code and subject_name are required."}, 400

    if len(subject_code) > 10:
        return {"error": "subject_code must be at most 10 characters."}, 400

    existing = Subject.query.filter_by(subject_code=subject_code).first()
    if existing:
        return {"error": "Subject code already exists."}, 409

    try:
        subject = Subject(subject_code=subject_code, subject_name=subject_name)
        db.session.add(subject)

        # Flush to ensure subject.id exists before creating the audit entry.
        db.session.flush()

        user_id = get_current_user_id()
        if user_id:
            log_action(
                action_type="create",
                table_name="subjects",
                record_id=subject.id,
                old_value=None,
                new_value=subject.to_dict(),
                changed_by=user_id,
                commit=False,
            )

        db.session.commit()
    except Exception:
        db.session.rollback()
        return {"error": "Failed to create subject."}, 500

    return {"message": "Subject created successfully.", "subject": subject.to_dict()}, 201


def get_subjects(page=1, per_page=100):
    """Return paginated subjects for teacher/admin workflows."""
    page = max(1, int(page))
    per_page = max(1, min(int(per_page), 500))

    query = Subject.query.order_by(Subject.subject_code.asc())
    total = query.count()
    items = query.offset((page - 1) * per_page).limit(per_page).all()

    return {
        "items": [item.to_dict() for item in items],
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": total,
            "pages": (total + per_page - 1) // per_page,
        },
    }


def update_subject(subject_id, data):
    """Update subject code/name and write an audit event for the change."""
    if not isinstance(data, dict):
        return {"error": "Invalid JSON payload."}, 400

    subject = Subject.query.filter_by(id=subject_id).first()
    if not subject:
        return {"error": "Subject not found."}, 404

    old_snapshot = subject.to_dict()

    next_code = data.get("subject_code", subject.subject_code)
    next_name = data.get("subject_name", subject.subject_name)

    if isinstance(next_code, str):
        next_code = next_code.strip().upper()
    if isinstance(next_name, str):
        next_name = next_name.strip()

    if not next_code or not next_name:
        return {"error": "subject_code and subject_name are required."}, 400

    if len(next_code) > 10:
        return {"error": "subject_code must be at most 10 characters."}, 400

    duplicate = Subject.query.filter(
        Subject.subject_code == next_code,
        Subject.id != subject_id,
    ).first()
    if duplicate:
        return {"error": "Subject code already exists."}, 409

    try:
        subject.subject_code = next_code
        subject.subject_name = next_name
        db.session.flush()

        user_id = get_current_user_id()
        if user_id:
            log_action(
                action_type="update",
                table_name="subjects",
                record_id=subject.id,
                old_value=old_snapshot,
                new_value=subject.to_dict(),
                changed_by=user_id,
                commit=False,
            )

        db.session.commit()
    except Exception:
        db.session.rollback()
        return {"error": "Failed to update subject."}, 500

    return {"message": "Subject updated successfully.", "subject": subject.to_dict()}, 200


def delete_subject(subject_id):
    """Delete a subject and record audit details for traceability."""
    subject = Subject.query.filter_by(id=subject_id).first()
    if not subject:
        return {"error": "Subject not found."}, 404

    old_snapshot = subject.to_dict()

    try:
        db.session.delete(subject)
        db.session.flush()

        user_id = get_current_user_id()
        if user_id:
            log_action(
                action_type="delete",
                table_name="subjects",
                record_id=subject_id,
                old_value=old_snapshot,
                new_value=None,
                changed_by=user_id,
                commit=False,
            )

        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return {
            "error": "Subject cannot be deleted because it is referenced by marks/grades."
        }, 409
    except Exception:
        db.session.rollback()
        return {"error": "Failed to delete subject."}, 500

    return {"message": "Subject deleted successfully."}, 200
