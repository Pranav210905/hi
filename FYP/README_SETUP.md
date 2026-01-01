# Adaptive Learning Platform - Setup Guide

A beautiful, resume-centric adaptive learning platform with hierarchical folder management for organizing company-specific preparation materials.

## Features

- User authentication (Register & Login)
- Hierarchical folder structure: Company → Topic → Files
- Beautiful, modern UI with smooth animations
- Responsive design
- File upload system
- MongoDB database with Express.js backend

## Prerequisites

Before running this project, make sure you have:

1. **Node.js** (v16 or higher) installed
2. **MongoDB** installed and running locally
   - Default connection: `mongodb://localhost:27017/adaptive-learning`
   - Or use MongoDB Atlas (cloud database)

## Installation Steps

### 1. Install MongoDB

If you don't have MongoDB installed:

**For macOS (using Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**For Windows:**
- Download from https://www.mongodb.com/try/download/community
- Install and start MongoDB service

**For Linux (Ubuntu/Debian):**
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### 4. Configure Environment Variables

The backend `.env` file is already configured with default values:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/adaptive-learning
JWT_SECRET=your-secret-key-change-this-in-production
```

**Important:** For production, change the `JWT_SECRET` to a secure random string.

## Running the Application

### Option 1: Run Backend and Frontend Separately (Recommended for Development)

**Terminal 1 - Start Backend Server:**
```bash
cd backend
npm start
```

The backend will run on `http://localhost:5000`

**Terminal 2 - Start Frontend:**
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

### Option 2: Using MongoDB Atlas (Cloud Database)

If you prefer using MongoDB Atlas instead of local MongoDB:

1. Create a free account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Get your connection string
4. Update `backend/.env`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/adaptive-learning
```

## Using the Application

1. **Register**: Create a new account at `/register`
2. **Login**: Sign in with your credentials at `/login`
3. **Dashboard**: After login, you'll see the dashboard where you can:
   - Create companies (e.g., Google, Microsoft, Amazon)
   - Click on a company to create topics (e.g., Aptitude, Reasoning, Coding)
   - Click on a topic to upload files (PDFs, documents, etc.)

## Project Structure

```
project/
├── backend/
│   ├── models/         # MongoDB models (User, Company, Topic, File)
│   ├── routes/         # API routes
│   ├── middleware/     # Authentication middleware
│   ├── index.js        # Express server
│   └── .env            # Environment variables
├── src/
│   ├── components/     # React components
│   ├── context/        # Auth context
│   ├── pages/          # Login, Register, Dashboard pages
│   ├── services/       # API service
│   ├── styles/         # CSS files
│   └── App.jsx         # Main app with routing
└── package.json
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user

### Companies
- POST `/api/companies` - Create company
- GET `/api/companies` - Get all companies
- GET `/api/companies/:id` - Get company by ID
- DELETE `/api/companies/:id` - Delete company

### Topics
- POST `/api/topics` - Create topic
- GET `/api/topics/company/:companyId` - Get topics by company
- GET `/api/topics/:id` - Get topic by ID
- DELETE `/api/topics/:id` - Delete topic

### Files
- POST `/api/files` - Upload file
- GET `/api/files/topic/:topicId` - Get files by topic
- DELETE `/api/files/:id` - Delete file

## Technologies Used

### Frontend
- React 18
- React Router DOM
- Axios
- Modern CSS with animations and gradients

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing
- Multer for file uploads

## Design Features

- Beautiful gradient backgrounds
- Smooth animations and transitions
- Responsive design for all screen sizes
- Modern card-based UI
- Clean typography and spacing
- Professional color scheme (blues and greens)

## Troubleshooting

**MongoDB Connection Error:**
- Make sure MongoDB is running: `mongod` or check system services
- Verify the connection string in `backend/.env`

**Port Already in Use:**
- Change the PORT in `backend/.env`
- Or kill the process using the port

**CORS Errors:**
- Make sure backend is running on port 5000
- Check that CORS is enabled in `backend/index.js`

## Next Steps

This is the foundation for the adaptive learning platform. Future implementations will include:
- Question bank management
- Practice sessions
- Performance tracking
- AI-powered difficulty adjustment
- Coding environment integration
- Analytics dashboard

## Support

For issues or questions, please check the MongoDB connection and ensure all dependencies are properly installed.
