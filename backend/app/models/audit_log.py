from app.extensions import db
from datetime import datetime
import uuid

class AuditLog(db.Model):
    __tablename__ = 'audit_logs' # Define the table name for the AuditLog model

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4())) # Unique identifier for each audit log entry, generated as a UUID string

    action_type = db.Column(db.String(50), nullable=False) # Type of action performed (e.g., "create_grade", "update_grade")

    table_name = db.Column(db.String(50), nullable=False) # Name of the table affected by the action (e.g., "grades")

    record_id = db.Column(db.String(36), nullable=False) # Unique identifier of the record affected by the action

    old_value = db.Column(db.JSON, nullable=True) # JSON string representing the old value of the record before the action (nullable for create actions)

    new_value = db.Column(db.JSON, nullable=True) # JSON string representing the new value of the record after the action (nullable for delete actions)

    changed_by = db.Column(db.String(36), db.ForeignKey('users.unique_id'), nullable=False) # Foreign key to the User model, indicating who performed the action

    timestamp = db.Column(db.DateTime, default=datetime.utcnow) # Timestamp for when the action was performed

    def to_dict(self):
        """
        Convert the AuditLog instance to a dictionary for easy serialization.
        """
        return {
            'id': self.id,
            'action_type': self.action_type,
            'table_name': self.table_name,
            'record_id': self.record_id,
            'old_value': self.old_value,
            'new_value': self.new_value,
            'changed_by': self.changed_by,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None # Convert datetime to ISO format string
        }