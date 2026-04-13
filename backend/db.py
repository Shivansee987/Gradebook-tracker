"""
This file is responsible for initializing the database tables for the Flask application. It imports the create_app function to create the Flask application instance and the db object from the extensions module to interact with the database. The script creates an application context, which is necessary for performing database operations, and then calls db.create_all() to create all the tables defined in the application's models. Finally, it prints a success message to indicate that the database tables have been created successfully.
"""

from app import create_app
from app.extensions import db

app = create_app()

with app.app_context():
    db.create_all()
    print("✅ Database tables created successfully!")