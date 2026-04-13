from app.models.user import User # this import is necessary to access the User model for creating new users in the database

from app.extensions import db, bcrypt # this import is necessary to use the database and bcrypt extensions for hashing passwords and saving users to the database

from flask_jwt_extended import create_access_token # this import is necessary for creating JWT access tokens for user authentication

VALID_ROLES = ['admin', 'teacher', 'student']

def create_user(data):
    """
    This function creates a new user in the database. It takes a dictionary of user data as input, validates the required fields and role, checks for existing users with the same username or email, hashes the password using bcrypt, and then creates and saves the new user to the database. If any validation fails, it returns an appropriate error message and status code.
    """

    username = data.get('username')
    email = data.get('email')   
    password = data.get('password')
    role = data.get('role', 'none')

    # BASIC VALIDATION, CHECK FOR MISSING FIELDS AND VALID ROLE
    if not all([username, email, password]):
        return {'error': 'Username, email, and password are required.'}, 400
    
    # Check if the role is valid
    if role not in VALID_ROLES:
        return {'error': f'Invalid role. Valid roles are: {", ".join(VALID_ROLES)}.'}, 400
    
    # Check if the username or email already exists in the database
    existing_user = User.query.filter((User.username == username) | (User.email == email)).first()

    # If a user with the same username or email already exists, return an error response
    if existing_user:
        return {'error': 'Username or email already exists.'}, 400
    
    # Hash the password using bcrypt before storing it in the database
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    # Create a new User object with the provided data and the hashed password
    new_user = User(username=username, email=email, password=hashed_password, role=role)

    # Add the new user to the database
    db.session.add(new_user)
    db.session.commit()

    return {'message': 'User created successfully.'}, 201


def login_user(data):

    email = data.get('email')
    password = data.get('password')

    # basic validation, check for missing fields
    if not all([email, password]):
        return {'error': 'Email and password are required.'}, 400
    
    # check if the user exists in the database
    user = User.query.filter_by(email=email).first()

    if not user:
        return {'error': 'Invalid email or password.'}, 401
    
    # check if the provided password matches the stored hashed password
    if not bcrypt.check_password_hash(user.password, password):
        return {'error': 'Invalid email or password.'}, 401
    
    # create a JWT access token for the authenticated user
    access_token = create_access_token(
        identity = {
            "unique_id": user.unique_id,
            "role": user.role
        }
    )

    # return the access token and user data (excluding the password hash) in the response with a success message
    return {
        'message': 'Login successful.',
        'access_token': access_token,
        'user': user.to_dict() # Return user data as a dictionary, excluding the password hash
    }, 200