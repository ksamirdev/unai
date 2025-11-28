# UnAI - Deepfake Detection & Image Regeneration

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

UnAI is a comprehensive solution designed to detect deepfake images and regenerate authentic versions. It combines a robust Node.js backend with a Python-based AI pipeline and a modern React frontend to provide a seamless user experience.

## 🚀 Features

- **Deepfake Detection**: Analyze images to determine if they are AI-generated or manipulated using advanced deep learning models.
- **Image Regeneration**: Restore or regenerate images to their authentic state.
- **User Authentication**: Secure login, registration, and OTP verification.
- **Dashboard**: User-friendly interface to upload images and view results.
- **History**: Track past detections and regenerations.

## 🛠️ Tech Stack

### Frontend

- **React.js**: UI library for building the interface.
- **Axios**: For API requests.
- **CSS**: Custom styling for components and pages.

### Backend

- **Node.js & Express**: Server-side framework.
- **MongoDB & Mongoose**: Database for storing user data and history.
- **JWT**: Secure authentication.
- **Multer**: File upload handling.

### AI & Machine Learning

- **Python**: Core language for AI scripts.
- **TensorFlow/Keras**: Deep learning framework for the detection model (`DeepFake.h5`).
- **OpenCV**: Image processing.
- **NumPy**: Numerical operations.

## 📂 Project Structure

```
UnAI/
├── backend/             # Node.js API Server
│   ├── config/          # Database & Email config
│   ├── middleware/      # Auth & Upload middleware
│   ├── models/          # Mongoose schemas (User, Detection)
│   ├── python_scripts/  # AI detection & regeneration scripts
│   ├── routes/          # API routes (Auth, Image, User)
│   └── server.js        # Entry point
├── frontend/            # React Application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Application pages
│   │   └── utils/       # Helper functions
├── models/              # Pre-trained AI Models
│   ├── DeepFake.h5
│   └── regenerator_model.pth
└── uploads/             # Directory for uploaded & processed images
```

## ⚙️ Installation & Setup

### Prerequisites

- Node.js (v16+)
- Python (v3.8+)
- MongoDB (Local or Atlas)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd UnAI
```

### 2. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory. You can use the provided `.env.example` as a template:

```bash
cp .env.example .env
```

Update the `.env` file with your specific configuration (MongoDB URI, Email credentials, etc.).

### 3. Python Environment Setup

Ensure you have the required Python libraries installed. You can install them using pip:

```bash
pip install numpy opencv-python tensorflow
```

### 4. Frontend Setup

Navigate to the frontend directory and install dependencies:

```bash
cd ../frontend
npm install
```

## 🏃‍♂️ Running the Application

1. **Start the Backend Server**:

   ```bash
   cd backend
   npm start
   # or for development
   npm run dev
   ```

2. **Start the Frontend Application**:
   ```bash
   cd frontend
   npm start
   ```

The frontend will run on `http://localhost:3000` and the backend on `http://localhost:5000`.

## 👥 Authors

- **Samir Kumar Gupta**
- **Aditya Gaur**
- **Nishant Kumar**

## 📄 License

This project is licensed under the MIT License.
