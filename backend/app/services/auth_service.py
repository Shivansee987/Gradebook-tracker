from app.models.user import User
from app.extensions import db, bcrypt

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
