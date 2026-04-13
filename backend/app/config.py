import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """
    This class defines the configuration settings for the Flask application. It loads sensitive information such as secret keys and database connection URLs from environment variables, which are typically stored in a .env file for security reasons. This allows for better security and flexibility when deploying the application across different environments (development, testing, production).
    """
    SECRET_KEY = os.getenv('SECRET_KEY') # Secret key for session management and other security-related needs

    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY') # Secret key for JWT authentication

    # Database configuration
    # Flask-SQLAlchemy requires SQLALCHEMY_DATABASE_URI exactly.
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL') or 'sqlite:///app.db' # Database URL (Neon/Postgres) with local fallback

    SQLALCHEMY_TRACK_MODIFICATIONS = False # Disable SQLAlchemy event system to save resources