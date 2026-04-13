"""
This file defines the Grade model for the Flask application. The Grade model represents a grade entry for a student in a specific subject, including the marks obtained and the grading version used. It includes fields for the unique identifier, student ID, subject ID, marks ID, letter grade, grading version ID, and a timestamp for when the grade entry was created. The model also includes a method to convert the instance to a dictionary format for easy serialization when returning responses from API endpoints.
"""


from app.extensions import db
from datetime import datetime
import uuid

class Grade(db.Model):
    __tablename__ = 'grades' # define the table name for the Grade model

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4())) # unique identifier for each grade entry, generated as a UUID string

    student_id = db.Column(db.String(36), db.ForeignKey('users.unique_id'), nullable=False) # foreign key to the User model (student)

    subject_id = db.Column(db.String(36), db.ForeignKey('subjects.id'), nullable=False) # foreign key to the Subject model

    marks_id = db.Column(db.String(36), db.ForeignKey('marks.id'), nullable=False) # foreign key to the Marks model

    grade = db.Column(db.String(2), nullable=False) # letter grade (e.g., A, B, C)

    version_id = db.Column(db.String(36), db.ForeignKey('grading_versions.id'), nullable=False) # foreign key to the GradingVersion model

    created_at = db.Column(db.DateTime, default=datetime.utcnow) # timestamp for when the grade entry was created


    def to_dict(self):
        """
        Convert the Grade instance to a dictionary for easy serialization.
        """
        return {
            'id': self.id,
            'student_id': self.student_id,
            'subject_id': self.subject_id,
            'marks_id': self.marks_id,
            'grade': self.grade,
            'version_id': self.version_id,
            'created_at': self.created_at.isoformat() # convert datetime to ISO format string
        }

