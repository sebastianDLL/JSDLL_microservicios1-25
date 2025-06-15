# Auth Service

## Overview
This project is an authentication service built with Node.js and MySQL. It provides user management functionalities, including registration, login, and profile retrieval, while implementing JWT for secure authentication and authorization.

## Features
- User roles: Patients, Doctors, Admins
- JWT generation for secure login sessions
- RESTful API endpoints for user registration, login, and profile consultation
- Middleware for JWT validation and role extraction

## Project Structure
```
auth-service
├── .env                  # Environment variables for configuration
├── app.js                # Main application file
├── docker-compose.yml    # Docker configuration for services
├── Dockerfile            # Instructions for building the Docker image
├── package.json          # Project metadata and dependencies
├── README.md             # Project documentation
├── wait-for-db.sh        # Script to wait for MySQL to be ready
├── config
│   └── db.js            # Database connection configuration
└── src
    ├── controllers
    │   └── authController.js  # Logic for user authentication
    ├── middleware
    │   └── authenticate.js     # JWT validation middleware
    ├── models
    │   └── userModel.js        # User data management
    └── routes
        └── authRoutes.js       # API routes for authentication
```

## Setup Instructions
1. Clone the repository:
   ```
   git clone <repository-url>
   cd auth-service
   ```

2. Create a `.env` file based on the provided `.env.example` template and fill in the required database and JWT configuration.

3. Build and run the application using Docker:
   ```
   docker-compose up --build
   ```

4. Access the application at `http://localhost:3000`.

## Usage
- **Register a User**: POST `/api/auth/register`
- **Login**: POST `/api/auth/login`
- **Get User Profile**: GET `/api/auth/profile` (requires JWT)

## License
This project is licensed under the MIT License.