# Chatbot Frontend (Challenge)

This is a Next.js-based frontend application for the chatbot, designed to interact with the FastAPI backend.

## Prerequisites
Ensure you have the following installed:
- Node.js 18+
- npm or pnpm
- Docker & Docker Compose (if running with Docker)

## Setup Instructions

### 1. Clone the Repository
```sh
git clone https://github.com/valentindush/chatbot-challenge-fe.git
cd nextjs-chatbot
```

### 2. Install Dependencies
```sh
npm install  # or use pnpm install
```

### 3. Configure Environment Variables
Copy the example environment file and update it with your own values:
```sh
cp .env.example .env.local
```

Ensure your `.env.local` file contains the necessary backend API URL.

### 4. Run the Application
#### Using Next.js directly:
```sh
npm run dev  # or pnpm dev
```

#### Using Docker Compose:
```sh
docker compose up --build
```

The application will be available at:
- **Frontend:** [http://localhost:3000](http://localhost:3000)