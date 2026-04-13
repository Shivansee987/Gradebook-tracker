from flask import Flask
from .config import Config
from .extensions import db, bcrypt, jwt
from app.routes.auth_routes import auth_bp # Import the authentication blueprint
from app.routes.grading_routes import grading_bp # Import the grading blueprint
from app.routes.marks_routes import marks_bp # Import the marks blueprint
from app.models.user import User
from app.models.subject import Subject
from app.models.marks import Marks
from app.models.grading_version import GradingVersion
from app.models.grade import Grade
from app.models.audit_log import AuditLog


def create_app():
    """
    This function creates and configures the Flask application instance. It initializes the database, bcrypt, and JWT extensions, and registers the API blueprint.
    """
    app = Flask(__name__) # Create the Flask application instance
    app.config.from_object(Config) # Load configuration from the Config class

    db.init_app(app) # Initialize the database extension with the app

    bcrypt.init_app(app) # Initialize the bcrypt extension with the app
    jwt.init_app(app) # Initialize the JWT extension with the app

    app.register_blueprint(auth_bp) # Register the authentication blueprint
    app.register_blueprint(grading_bp) # Register the grading blueprint
    app.register_blueprint(marks_bp) # Register the marks blueprint
    return app

