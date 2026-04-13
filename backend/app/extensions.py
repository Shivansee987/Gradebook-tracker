from flask_sqlalchemy import SQLAlchemy # this import is necessary for the database extension to work properly
from flask_bcrypt import Bcrypt # this import is necessary for the bcrypt extension to work properly
from flask_jwt_extended import JWTManager # this import is necessary for the JWT extension to work properly

db = SQLAlchemy() # Initialize the SQLAlchemy extension
bcrypt = Bcrypt() # Initialize the Bcrypt extension
jwt = JWTManager() # Initialize the JWT extension

