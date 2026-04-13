from datetime import datetime
from app.extensions import db
import uuid

class GradingVersion(db.Model):
    """
    Represents a version of the grading system with specific weights for exams and assignments. Each grading version has a unique identifier, weights for exams and assignments, an active status, and a creation timestamp. This model allows the application to manage different grading schemes and switch between them as needed.
    """

    __tablename__ = 'grading_versions' # Define the table name for the GradingVersion model

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4())) # Unique identifier for each grading version, generated as a UUID string

    exam_weight = db.Column(db.Float, nullable=False) # Weightage of the exam marks in the grading system

    assignment_weight = db.Column(db.Float, nullable=False) # Weightage of the assignment marks in the grading system

    is_active = db.Column(db.Boolean, default=True) # Indicates whether this grading version is currently active

    created_at = db.Column(db.DateTime, default=datetime.utcnow) # Timestamp for when the grading version was created

    def to_dict(self):
        """
        Convert the GradingVersion instance to a dictionary for easy serialization. By serializing the grading version, we can easily return its details in API responses without exposing any internal implementation details.
        """
        return {
            'id': self.id,
            'exam_weight': self.exam_weight,
            'assignment_weight': self.assignment_weight,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() # Convert datetime to ISO format string
        }