# 🍃 IngredientAI - Backend REST API

A comprehensive backend API built with **Django** and **Django REST Framework** that provides ingredient analysis powered by **Google's Gemini AI**.

---

## 🚀 Features

- **Ingredient Analysis**: Extract and analyze ingredients from images.
- **AI-Powered Insights**: Generate health recommendations using Gemini AI.
- **User Authentication**: Secure JWT-based authentication system.
- **Medical History Management**: Track and manage user health details for personalized results.
- **RESTful API**: Clean and well-documented API endpoints.
- **PostgreSQL Database**: Reliable data storage and management.
- **Cloudinary Integration**: Cloud-based image storage.
- **Redis Caching**: Cache analysis results for improved performance.

---

## 🛠 Tech Stack

- **Backend Framework**: Django + Django REST Framework
- **AI/LLM**: Google Gemini
- **Authentication**: JWT (JSON Web Tokens)
- **Database**: PostgreSQL
- **Image Storage**: Cloudinary
- **Caching**: Redis
- **API Documentation**: Swagger/OpenAPI

---

## 📋 Prerequisites

- Python 3.8+
- PostgreSQL 12+
- Redis
- Git

---

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd <your-project-directory>
```

### 2. Create Virtual Environment

```
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate
```

### 3. Install Dependencies

```
pip install -r requirements.txt
```

### 4. Environment Setup

Create a .env file in the root directory and add:

```
# API Keys
GEMINI_API_KEY=your_gemini_api_key_here

# Database Configuration
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=localhost
DB_PORT=5432

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Django Secret Key
SECRET_KEY=your_secret_key_here
```

### 6. Apply Migrations

```
python manage.py makemigrations
python manage.py migrate
```

### 7. Create Superuser (Optional)

```
python manage.py createsuperuser
```

### 8. Run Development Server

```
python manage.py runserver
```

The API will be available at http://127.0.0.1:8000/

## 📚 API Documentation

Base URL: http://127.0.0.1:8000/api/v1/

Swagger Docs: http://127.0.0.1:8000/api/docs/

## 🔗 API Endpoints

### **Authentication**

| Method        | Endpoint                       | Description                                   |
| ------------- | ------------------------------ | --------------------------------------------- |
| POST          | `/api/v1/auth/register/`       | Register a new user                           |
| POST          | `/api/v1/auth/login/`          | User login                                    |
| POST          | `/api/v1/auth/logout/`         | User logout                                   |
| POST          | `/api/v1/auth/refresh/`        | Refresh JWT token                             |
| GET/PUT/PATCH | `/api/v1/auth/profile/`        | Get, update, or partially update user profile |
| DELETE        | `/api/v1/auth/delete-account/` | Delete own account                            |

---

### **Ingredient Analysis**

| Method | Endpoint                         | Description                    |
| ------ | -------------------------------- | ------------------------------ |
| POST   | `/api/v1/analysis/analyze/`      | Analyze ingredients from image |
| GET    | `/api/v1/analysis/history/`      | Get analysis history           |
| GET    | `/api/v1/analysis/history/{id}/` | Get specific analysis          |
| DELETE | `/api/v1/analysis/history/{id}/` | Delete specific analysis       |

---

### **Medical History**

| Method             | Endpoint                 | Description                            |
| ------------------ | ------------------------ | -------------------------------------- |
| GET/POST/PUT/PATCH | `/api/v1/medical/`       | Get, create, or update medical history |
| GET                | `/api/v1/medical/check/` | Check medical compatibility            |

---

## 🧑‍💻 Contributing

1. **Fork** the repo
2. **Create a new branch** (`feature/your-feature`)
3. **Commit changes** (`git commit -m "Add feature"`)
4. **Push to branch** (`git push origin feature/your-feature`)
5. **Open a Pull Request**
