from app.models.user import User
from sqlalchemy import func


def get_registered_students(page=1, per_page=50):
    """Return paginated users with role='student' for teacher/admin dashboards."""
    page = max(1, int(page))
    per_page = max(1, min(int(per_page), 500))

    # Include legacy role values (e.g. 'none') and case/whitespace variants.
    normalized_role = func.lower(func.trim(func.coalesce(User.role, "")))
    query = User.query.filter(normalized_role.in_(["student", "none"]))
    query = query.order_by(User.created_at.desc())
    total = query.count()

    students = query.offset((page - 1) * per_page).limit(per_page).all()

    return {
        "items": [student.to_dict() for student in students],
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": total,
            "pages": (total + per_page - 1) // per_page,
        },
    }


def get_student_profile(user_id):
    """Return student profile for the authenticated student dashboard."""
    student = User.query.filter_by(unique_id=user_id).first()
    if not student:
        return {"error": "Student not found."}, 404

    role = (student.role or "").strip().lower()
    if role != "student":
        return {"error": "Only student accounts can access this resource."}, 403

    return {"student": student.to_dict()}, 200
