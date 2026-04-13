from app.extensions import db
from datetime import datetime
import uuid

class Marks(db.Model):
    __tablename__ = 'marks' # Define the table name for the Marks model

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4())) # Unique identifier for each mark entry, generated as a UUID string

    student_id = db.Column(db.String(36), db.ForeignKey('users.unique_id'), nullable=False) # Foreign key to the User model (student)

    subject_id = db.Column(db.String(36), db.ForeignKey('subjects.id'), nullable=False) # Foreign key to the Subject model

    exam_marks = db.Column(db.Float, nullable=False) # Marks obtained in the exam

    assignment_marks = db.Column(db.Float, nullable=False) # Marks obtained in assignments

    created_at = db.Column(db.DateTime, default=datetime.utcnow) # Timestamp for when the marks entry was created

    # relationship
    student = db.relationship('User', backref=db.backref('marks', lazy=True)) # Relationship to the User model (student)
    subject = db.relationship('Subject', backref=db.backref('marks', lazy=True)) # Relationship to the Subject model

    
    def to_dict(self):
        """
        Convert the Marks instance to a dictionary for easy serialization.
        """
        return {
            'id': self.id,
            'student_id': self.student_id,
            'subject_id': self.subject_id,
            'exam_marks': self.exam_marks,
            'assignment_marks': self.assignment_marks,
            'created_at': self.created_at.isoformat() # Convert datetime to ISO format string
        }
