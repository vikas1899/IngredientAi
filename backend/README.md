# Backend REST API's For IngredientAi

A comprehensive backend API built with Django and Django REST Framework that provides ingredient analysis using OCR technology and AI-powered health insights.

## 🚀 Features

- **Ingredient Analysis**: Extract and analyze ingredients from images using PaddleOCR
- **AI-Powered Insights**: Generate health recommendations using Groq AI LLM
- **User Authentication**: JWT-based authentication system
- **Medical History Management**: Track and manage user medical information
- **RESTful API**: Clean, documented API endpoints
- **PostgreSQL Database**: Robust data storage and management
- **React Frontend Ready**: CORS-enabled for React integration

## 🛠 Tech Stack

- **Backend Framework**: Django + Django REST Framework
- **OCR Engine**: PaddleOCR
- **AI/LLM**: Groq AI
- **Authentication**: JWT (JSON Web Tokens)
- **Database**: PostgreSQL
- **API Documentation**: Swagger/OpenAPI

## 📋 Prerequisites

- Python 3.8+
- PostgreSQL 12+
- Node.js 16+ (for React frontend)
- Git

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd <your-project-directory>
```

### 2. Create Virtual Environment

```bash
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Environment Setup

Create a `.env` file in the root directory and add the following variables:

```env
# API Keys
LANGCHAIN_API_KEY=your_langchain_api_key_here
GROQ_API_KEY=your_groq_api_key_here

# Database Configuration
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=localhost
DB_PORT=5432

# Django Secret Key
SECRET_KEY=your_secret_key_here
```

### 5. Database Setup

Make sure PostgreSQL is running and create your database:

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE your_database_name;
CREATE USER your_database_user WITH PASSWORD 'your_database_password';
GRANT ALL PRIVILEGES ON DATABASE your_database_name TO your_database_user;
```

### 6. Apply Migrations

```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate
```

### 7. Create Superuser (Optional)

```bash
python manage.py createsuperuser
```

### 8. Run the Development Server

```bash
python manage.py runserver
```

The API will be available at `http://127.0.0.1:8000/`

## 📚 API Documentation

### Base URL

```
http://127.0.0.1:8000/api/v1/
```

### Swagger Documentation

Access the interactive API documentation at:

```
http://127.0.0.1:8000/api/docs/
```

## 🔗 API Endpoints

### Authentication Endpoints

| Method | Endpoint                       | Description                   |
| ------ | ------------------------------ | ----------------------------- |
| POST   | `/api/v1/auth/register/`       | Register a new user           |
| POST   | `/api/v1/auth/login/`          | User login                    |
| POST   | `/api/v1/auth/logout/`         | User logout                   |
| POST   | `/api/v1/auth/refresh/`        | Refresh JWT token             |
| GET    | `/api/v1/auth/profile/`        | Get user profile              |
| PUT    | `/api/v1/auth/profile/`        | Update user profile           |
| PATCH  | `/api/v1/auth/profile/`        | Partially update user profile |
| DELETE | `/api/v1/auth/delete-account/` | Delete own account            |

### Analysis Endpoints

| Method | Endpoint                         | Description                    |
| ------ | -------------------------------- | ------------------------------ |
| POST   | `/api/v1/analysis/analyze/`      | Analyze ingredients from image |
| GET    | `/api/v1/analysis/history/`      | Get analysis history           |
| GET    | `/api/v1/analysis/history/{id}/` | Get specific analysis          |
| DELETE | `/api/v1/analysis/history/{id}/` | Delete specific analysis       |

### Medical History Endpoints

| Method | Endpoint                 | Description                      |
| ------ | ------------------------ | -------------------------------- |
| GET    | `/api/v1/medical/`       | Get medical history              |
| POST   | `/api/v1/medical/`       | Create medical history           |
| PUT    | `/api/v1/medical/`       | Update medical history           |
| PATCH  | `/api/v1/medical/`       | Partially update medical history |
| GET    | `/api/v1/medical/check/` | Check medical compatibility      |

## 🔒 Authentication

This API uses JWT (JSON Web Token) authentication. Include the access token in your requests:

```bash
# Header
Authorization: Bearer <your_access_token>
```

### Example Usage

````bash
# Register
curl -X POST http://127.0.0.1:8000/api/v1/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "repeat_password": "securepassword123"
}'

# Login
curl -X POST http://127.0.0.1:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
  "username": "username",
  "password": "password"
}'


## 🧪 Testing

Run the test suite:

```bash
python manage.py test
````

## 🔧 Configuration

### Key Settings

- **DEBUG**: Set to `False` in production
- **ALLOWED_HOSTS**: Configure for your domain
- **CORS**: Enabled for React frontend integration
- **Database**: PostgreSQL configuration via environment variables

### Required Environment Variables

```env
LANGCHAIN_API_KEY=     # LangChain API key for AI features
GROQ_API_KEY=          # Groq AI API key for LLM
DB_NAME=               # PostgreSQL database name
DB_USER=               # PostgreSQL username
DB_PASSWORD=           # PostgreSQL password
DB_HOST=               # Database host (usually localhost)
DB_PORT=               # Database port (usually 5432)
SECRET_KEY=            # Django secret key
```

## 🚀 Deployment

### Production Checklist

- [ ] Set `DEBUG = False`
- [ ] Configure `ALLOWED_HOSTS`
- [ ] Use environment variables for sensitive data
- [ ] Set up proper database connection pooling
- [ ] Configure static file serving
- [ ] Set up SSL/HTTPS
- [ ] Configure CORS for production domains

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Error**

   - Verify PostgreSQL is running
   - Check database credentials in `.env`
   - Ensure database exists

2. **API Key Errors**

   - Verify Groq API key is valid
   - Check LangChain API key permissions

3. **Migration Issues**

   ```bash
   python manage.py makemigrations --empty <app_name>
   python manage.py migrate --fake-initial
   ```

4. **CORS Issues**
   - Check CORS settings in Django settings
   - Verify allowed origins for React frontend

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 👨‍💻 Author

**Vikas Jaygude**

- GitHub: [vikas1899](https://github.com/vikas1899)

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built with ❤️ by Vikas Jaygude using Django, DRF, PaddleOCR, and Groq AI
