# SkillSphere

SkillSphere is a modern full-stack MERN web application built as a university student project. It serves as a skill-sharing and mentorship platform where users can create profiles, showcase skills, upload portfolio items, and manage mentorship bookings.

## Tech Stack
- **Frontend**: React.js (Vite), Tailwind CSS, React Router DOM, Axios, Lucide React (Icons)
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT Auth, Multer
- **Cloud/DevOps**: Azure Blob Storage uploads, Azure App Service deployment support, and environment-based cloud configuration.

## Features
- JWT-based User Authentication
- Browse and search skills
- Create, Read, Update, Delete (CRUD) Skill Listings
- Adaptive image uploads using local storage in development or Azure Blob Storage when configured
- Book Mentorship Sessions (Mentee view)
- Manage Booking Requests (Mentor view)

## Project Structure
The project is divided into two separate applications to prepare for modern CI/CD and containerization:
- `/frontend` - React Vite Application
- `/backend` - Node.js Express API

## DevOps / CI-CD

This repository includes a root `Jenkinsfile` for Jenkins-based CI/CD and `docker-compose.yml` for local deployment.

Use `DEVOPS_IMPLEMENTATION.md` for the exact setup flow that matches the report sections:
- GitHub repo setup
- Docker Hub image creation
- Jenkins build and push pipeline
- Compose-based running containers
- Deployment screenshots for the final report

## Running Locally

### Prerequisites
- Node.js (v16+)
- Local MongoDB running on `mongodb://127.0.0.1:27017`

### Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Ensure the `.env` file exists with the following values:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/skillsphere
   JWT_SECRET=supersecretjwtkey_for_development
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Open a second terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser to the URL provided by Vite (usually `http://localhost:5173`).

## Azure Integration Guide

The application is currently configured to use local disk storage (`backend/uploads`) to allow for rapid offline development. To switch to **Azure Blob Storage**:

1. Obtain your Azure Storage Connection String and Container Name.
2. Add them to `backend/.env`:
   ```env
   AZURE_STORAGE_CONNECTION_STRING=your_string_here
   AZURE_STORAGE_CONTAINER_NAME=skillsphere-uploads
   ```
3. Open `backend/src/routes/uploadRoutes.js` and implement the Azure SDK logic in the provided stub section, changing `multer` from `diskStorage` to `memoryStorage`.

## DevOps Future Extension

This project is structured so that you can easily add:
- A `Dockerfile` in both `frontend` and `backend` for containerization.
- A `docker-compose.yml` in the root to run MongoDB, Frontend, and Backend together.
- `.github/workflows` for automated testing and deployment to Azure App Service.
