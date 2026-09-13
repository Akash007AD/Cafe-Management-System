# Cafe Management System

A full-stack cafe management system for managing kitchen operations, menu items, categories, availability, and stock through a web-based interface.

## Overview

The Cafe Management System provides a centralized platform for kitchen staff to manage the cafe menu and its availability.

Version 1 focuses on establishing the core backend, database, authentication, and kitchen dashboard functionality. The system is designed with a modular architecture so additional cafe operations can be introduced in future versions.

## Version 1 Features

- Kitchen user registration and authentication
- JWT-based authentication
- Secure password hashing
- Role-based kitchen access
- Menu item management
- Category management
- Menu pricing management
- Stock quantity management
- Menu availability management
- Kitchen dashboard
- RESTful API
- React-based frontend
- MySQL database integration
- Frontend and backend integration

## Technology Stack

### Backend

- Python
- FastAPI
- SQLAlchemy
- MySQL
- Pydantic
- JWT
- Argon2

### Frontend

- React
- Vite
- JavaScript
- Axios
- CSS

## System Architecture

The application consists of three primary layers:

**Frontend**

React provides the kitchen management interface and communicates with the backend through HTTP requests.

**Backend**

FastAPI provides the REST API, authentication, business logic, and database interaction.

**Database**

MySQL stores users, categories, menu items, and related application data.

```text
React Frontend
      |
      | HTTP / REST API
      v
FastAPI Backend
      |
      | SQLAlchemy
      v
MySQL Database
```

## Core API Modules

### Authentication

Provides user registration, login, and authenticated user information.

### Categories

Provides operations for creating, viewing, updating, and deleting menu categories.

### Menu

Provides operations for creating, viewing, updating, and deleting menu items, including price, stock quantity, category, and availability.

## Getting Started

### Prerequisites

Make sure the following are installed:

- Python 3.x
- Node.js
- npm
- MySQL
- Git

### Clone the Repository

```bash
git clone https://github.com/Akash007AD/Cafe-Management-System.git
cd Cafe-Management-System
```

### Backend Setup

Navigate to the backend directory:

```bash
cd cafe-backend
```

Create a virtual environment:

```bash
python -m venv .venv
```

Activate the virtual environment.

On Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install the dependencies:

```bash
pip install -r requirements.txt
```

Configure the required environment variables in a local `.env` file.

The `.env` file should remain local and must never be committed to the repository.

Start the backend:

```bash
uvicorn app.main:app --reload
```

The API will be available at:

```text
http://127.0.0.1:8000
```

FastAPI's interactive API documentation is available at:

```text
http://127.0.0.1:8000/docs
```

### Frontend Setup

Open a new terminal and navigate to:

```bash
cd kitchen-frontend
```

Install dependencies:

```bash
npm install
```

Configure the frontend API URL using a local `.env` file.

Start the development server:

```bash
npm run dev
```

The development URL will be displayed in the terminal.

## Development Workflow

The project uses separate Git branches for backend and frontend development.

- `main` — integrated and stable project
- `backend` — backend development
- `frontend` — frontend development

Development work should be completed and tested on the appropriate branch before being merged into `main`.

## Security

Sensitive configuration is kept outside the repository using environment variables.

The following must not be committed:

- Database credentials
- JWT secrets
- Environment files
- Local virtual environments
- API keys or other sensitive configuration

## Version 1 Status

Version 1 establishes the core cafe kitchen management platform with authentication, menu management, category management, stock tracking, availability management, and frontend-backend integration.

## Future Development

Future versions may expand the system with additional functionality such as:

- Customer management
- Order management
- Order tracking
- Billing
- Inventory management
- Kitchen order processing
- Sales and reporting
- Analytics
- Additional user roles
- Notifications

## License

This project is currently under development.
