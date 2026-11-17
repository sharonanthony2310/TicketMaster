# TicketMaster – Bug and Issue Tracking Platform

**TicketMaster** is a full-stack bug and issue tracking platform designed to help development teams organize projects, manage tasks, track bugs, and monitor project progress through a centralized dashboard.

The application provides a structured workspace where users can create projects, assign issues, manage priorities, update task statuses, collaborate through comments, and visualize project progress.

## Live Demo

- **Frontend:** https://ticket-master-gamma.vercel.app
- **Backend API:** https://ticketmaster-api-n17v.onrender.com
- **GitHub Repository:** https://github.com/sharonanthony2310/TicketMaster

## Features

- **User Authentication:** Secure registration and login using JWT and password hashing.
- **Project Management:** Create, update, view, and delete projects.
- **Issue Tracking:** Create and manage bugs, tasks, and feature requests.
- **Priority Management:** Organize issues based on low, medium, high, and critical priorities.
- **Status Tracking:** Track issues through To Do, In Progress, and Done stages.
- **Team Management:** Manage project members and their roles.
- **Kanban Board:** Organize and visualize issues according to their current status.
- **Comments:** Collaborate and discuss issues through comments.
- **Analytics Dashboard:** View project and issue-related statistics.
- **User Settings:** Manage profile information and account settings.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, Vite |
| Styling | Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Authentication | JWT, bcryptjs |
| Routing | React Router |
| Icons | Lucide React |
| Data Visualization | Recharts |
| Deployment | Vercel, Render |

## Project Structure

```text
TicketMaster/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
└── README.md
```

## Installation and Setup

### Prerequisites

- Node.js
- npm
- MongoDB Atlas account
- Git

### 1. Clone the repository

```bash
git clone https://github.com/sharonanthony2310/TicketMaster.git
cd TicketMaster
```

### 2. Set up the backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT
