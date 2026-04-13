from app.extensions import db
import uuid

class Subject(db.Model):
    """
    This class defines the Subject model, which represents a subject in the database. Each subject has a unique identifier (id), a subject code, and a subject name. The model includes a method to convert an instance to a dictionary for easy serialization when sending data in API responses.
    """

    __tablename__ = 'subjects' # Define the table name for the Subject model

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4())) # Unique identifier for each subject, generated as a UUID string

    subject_code = db.Column(db.String(10), nullable=False, unique=True) # Subject code (e.g., MATH101)

    subject_name = db.Column(db.String(100), nullable=False) # Subject name (e.g., Calculus I)

    def to_dict(self):
        """
        Convert the Subject instance to a dictionary for easy serialization.
        """
        return {
            'id': self.id,
            'subject_code': self.subject_code,
            'subject_name': self.subject_name
        }