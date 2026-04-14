from app.extensions import db
from app.models.subject import Subject


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
