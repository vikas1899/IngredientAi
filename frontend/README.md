# IngredientAI Frontend

A modern React.js frontend application for the Ingredient Analysis API, built with Vite and styled with Tailwind CSS.

## Features

- User Authentication: Login, registration, and profile management.
- Image Upload & Analysis: Upload ingredient photos for AI-powered analysis.
- Medical History Integration: Personalized analysis based on user's medical conditions and allergies.
- Analysis History: View and manage past ingredient analyses.
- Responsive Design: Works seamlessly on desktop and mobile devices.
- Modern UI: Clean, intuitive interface with smooth animations.

## Tech Stack

- React 18: UI library.
- Vite: Build tool and dev server.
- Tailwind CSS: Utility-first CSS framework.
- React Router DOM: Client-side routing.
- Axios: HTTP client.
- Lucide React: Icon library.
- jsPDF & jspdf-autotable: For generating PDF reports of analysis.

## Project Structure

```
src/
├── components/
│   ├── Auth/
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── Analysis/
│   │   ├── Analyze.jsx
│   │   ├── History.jsx
│   │   └── AnalysisDetails.jsx
│   ├── Dashboard/
│   │   └── Dashboard.jsx
│   ├── Medical/
│   │   └── MedicalHistory.jsx
│   ├── Profile/
│   │   └── Profile.jsx
│   ├── LoadingSpinner.jsx
│   ├── Navbar.jsx
│   └── ProtectedRoute.jsx
├── contexts/
│   └── AuthContext.jsx
├── services/
│   └── apiService.js
├── App.jsx
├── main.jsx
└── index.css
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Running Django backend API

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd ingredient-analysis-frontend
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Environment Setup

Create a .env file in the root of the frontend directory and add your backend API URL:

```
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

4. Start the development server

```bash
npm run dev
# or
yarn dev
```

The application will be available at http://localhost:5173/

### Build for Production

```bash
npm run build
# or
yarn build
```

The built files will be in the dist directory.

## API Integration

The frontend integrates with the Django REST API with the following endpoints:

### Authentication

- POST /auth/login/ - User login
- POST /auth/register/ - User registration
- GET /auth/profile/ - Get user profile
- PUT /auth/profile/ - Update user profile
- POST /auth/logout/ - User logout

### Medical History

- GET /medical/ - Get medical history
- POST /medical/ - Create medical history
- PUT /medical/ - Update medical history
- GET /medical/check/ - Check if medical history exists

### Analysis

- POST /analysis/analyze/ - Analyze ingredient image
- GET /analysis/history/ - Get analysis history
- GET /analysis/history/{id}/ - Get specific analysis details
- DELETE /analysis/history/{id}/ - Delete a specific analysis

## 🔧 Key Components

### 🔒 Authentication Context

Manages user authentication state, login/logout functionality, and token management with automatic refresh.

### 🛡️ Protected Routes

Ensures authenticated access to protected pages and redirects unauthenticated users to login.

### 🌐 API Service

Centralized HTTP client with interceptors for token management and error handling.

### 📦 Component Features

- **Dashboard**: Overview of user activity and quick actions
- **Analyze**: Image upload with drag-and-drop, category selection, and real-time analysis
- **History**: Paginated list of past analyses with search and filtering
- **Medical History**: Interactive management of allergies and medical conditions
- **Profile**: User profile management and account settings

## 💻 Development

### 📜 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### 🎨 Code Style

The project uses ESLint for code linting. Run `npm run lint` to check for issues.

## 🎛️ Customization

- **Styling**: Modify `tailwind.config.js` for custom themes and colors
- **API URL**: Update `VITE_API_BASE_URL` in `.env` for different backend URLs
- **Components**: All components are modular and can be easily customized

## 🌐 Browser Support

| Browser | Support     |
| ------- | ----------- |
| Chrome  | ✅ (latest) |
| Firefox | ✅ (latest) |
| Safari  | ✅ (latest) |
| Edge    | ✅ (latest) |
