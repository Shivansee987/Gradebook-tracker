from flask import Flask
from .config import Config
from .extensions import db, bcrypt, jwt

def create_app():
    """
    This function creates and configures the Flask application instance. It initializes the database, bcrypt, and JWT extensions, and registers the API blueprint.
    """
    app = Flask(__name__) # Create the Flask application instance
    app.config.from_object(Config) # Load configuration from the Config class

    db.init_app(app) # Initialize the database extension with the app

    bcrypt.init_app(app) # Initialize the bcrypt extension with the app
    jwt.init_app(app) # Initialize the JWT extension with the app

    return app

