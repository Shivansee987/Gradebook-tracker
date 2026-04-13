from app.extensions import db
from datetime import datetime
import uuid

class User(db.Model):
    """
    This class defines the User model for the application. It represents a user in the system and includes fields for unique ID, username, email, password hash, role, and creation timestamp. The model also includes a method to convert the user object to a dictionary format for easy serialization when returning user data in API responses.
    """
    __tablename__ = 'users' # Explicitly set the table name for clarity

    unique_id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4())) # Unique identifier for the user, generated as a UUID string

    username = db.Column(db.String(100), unique=True, nullable=False) # Username must be unique and cannot be null

    email = db.Column(db.String(120), unique=True, nullable=False) # Email must be unique and cannot be null

    password = db.Column(db.String(128), nullable=False) # Password hash, cannot be null

    role = db.Column(db.String(20), nullable=False, default='none') # User role, defaults to 'none'

    created_at = db.Column(db.DateTime, default=datetime.utcnow) # Timestamp for when the user was created


    def to_dict(self):
        """
        Convert the User object to a dictionary for easy serialization. This is useful for returning user data in API responses without exposing sensitive information like the password hash.
        """
        return {
            'unique_id': self.unique_id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'created_at': self.created_at.isoformat() # Convert datetime to ISO format string
        }


    