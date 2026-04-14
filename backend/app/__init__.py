from flask import Flask, jsonify
from .config import Config
from .extensions import db, bcrypt, jwt
from app.routes.auth_routes import auth_bp # Import the authentication blueprint
from app.routes.grading_routes import grading_bp # Import the grading blueprint
from app.routes.marks_routes import marks_bp # Import the marks blueprint
from app.routes.report_routes import report_bp # Import the report blueprint
from app.routes.student_routes import student_bp # Import the student management blueprint
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
    app.register_blueprint(report_bp) # Register the report blueprint
    app.register_blueprint(student_bp) # Register the student management blueprint

    @app.errorhandler(404)
    def not_found(_error):
        return jsonify({'error': 'Resource not found.'}), 404

    @app.errorhandler(405)
    def method_not_allowed(_error):
        return jsonify({'error': 'Method not allowed.'}), 405

    @app.errorhandler(500)
    def internal_error(_error):
        return jsonify({'error': 'Internal server error.'}), 500

    @jwt.unauthorized_loader
    def unauthorized_response(message):
        return jsonify({'error': message}), 401

    @jwt.invalid_token_loader
    def invalid_token_response(message):
        return jsonify({'error': message}), 422

    @jwt.expired_token_loader
    def expired_token_response(_jwt_header, _jwt_payload):
        return jsonify({'error': 'Token has expired.'}), 401

    return app

