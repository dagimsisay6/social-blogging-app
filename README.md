# 📝 Social Blogging App

A full-stack social blogging platform that allows users to register, log in, write blog posts, read others' content, comment, and interact with an AI chatbot. Built using React.js, Node.js, Express.js, and MongoDB, it supports real-time content interaction and secure user authentication.

## 🌍 Live Links

🔗 **Frontend (Netlify):** https://idyllic-mandazi-bbce72.netlify.app/

🔗 **Backend (Render):** http://localhost:5001

📁 **GitHub Repository:** https://github.com/your-org/social-blogging-app

## 👥 Team Members

| Name            | Role              | GitHub Handle   |
| --------------- | ----------------- | --------------- |
| Florence Ndemi  | Frontend Engineer | @Fndemi         |
| Dagim Sisay     | Frontend Engineer | @dagimsisay6    |
| Solomon Nderitu | GenAI Engineer    | @Solomon-Nderit |

## 📌 Project Overview

The Social Blogging App enables users to:

- Register, log in, and reset passwords securely
- Browse all public blog posts with pagination
- Write, edit, or delete their own posts
- View and comment on any blog post
- Interact with an AI chatbot assistant for writing help
- Switch between light and dark UI themes
- View a personal dashboard with "My Posts" management

## ✨ Features

- **JWT-based Authentication** - Secure user registration and login
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **AI Chatbot Integration** - Floating AI assistant on all pages
- **Content Management** - Full CRUD operations for blog posts
- **User Interactions** - Comment system and post engagement
- **Theme Toggle** - Light and dark mode support
- **Personal Dashboard** - User-specific content management
- **Real-time Updates** - Dynamic content loading and updates

## 🧰 Tech Stack

### Frontend

- **React.js** (Vite)
- **Tailwind CSS**
- **Axios** for API calls
- **React Router DOM** for navigation

### Backend

- **Node.js** + **Express.js**
- **MongoDB Atlas** + **Mongoose**
- **JWT** & **bcrypt** for authentication
- **dotenv**, **cors**, **express-validator**

### AI Integration

- External AI Chatbot API (GenAI implementation)
- Real-time chat interface

### Deployment

- **Frontend:** Netlify
- **Backend:** Render or Railway
- **Database:** MongoDB Atlas

## 📁 Folder Structure

```
project-root/
├── client/                 → React frontend
│   ├── src/
│   │   ├── components/     → Reusable UI components
│   │   ├── pages/          → Route components
│   │   ├── context/        → React context providers
│   │   ├── services/       → API service functions
│   │   └── App.jsx         → Main app component
│   ├── public/
│   └── package.json
├── server/                 → Node.js backend
│   ├── controllers/        → Route logic
│   ├── routes/             → API endpoints
│   ├── models/             → MongoDB schemas
│   ├── middleware/         → Auth & validation
│   ├── server.js           → Express server setup
│   └── package.json
├── .env                    → Environment variables
└── README.md
```

## 🛠️ Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account
- Git

### Installation

1. **Clone the repository:**

```bash
git clone https://github.com/your-org/social-blogging-app.git
cd social-blogging-app
```

2. **Frontend Setup:**

```bash
cd client
npm install
npm run dev
```

3. **Backend Setup:**

```bash
cd server
npm install
npm run dev
```

## 🔐 Environment Variables

### Frontend

No environment variables needed - API endpoints are configured directly in the code.

### Backend (`server/.env`)

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
AI_API_KEY=your_ai_service_api_key
NODE_ENV=development
```

## 🚀 Deployment

### Frontend (Netlify)

- Build command: `npm run build`
- Publish directory: `dist`
- Add environment variables in Netlify dashboard

### Backend (Render/Railway)

- Connect GitHub repository
- Set environment variables
- Configure auto-deploy from `main` branch

### Redirect Handling

Create `client/public/_redirects` file:

```
/* /index.html 200
```

## 🧠 Git Workflow

- **main** → Stable production branch
- **dev** → Active development branch
- **Feature branches** → `feat/feature-name`, `fix/bug-name`

### Commit Convention

- `feat:` New features
- `fix:` Bug fixes
- `refactor:` Code refactoring
- `chore:` Maintenance tasks
- `docs:` Documentation updates

### Development Process

1. Create feature branch from `dev`
2. Make changes and commit
3. Push branch and create Pull Request
4. Code review by team members
5. Merge to `dev` after approval
6. Deploy `main` from `dev` when ready

## 📝 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Blog Posts

- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create new post
- `GET /api/posts/:id` - Get single post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post

### Comments

- `POST /api/posts/:id/comments` - Add comment
- `GET /api/posts/:id/comments` - Get post comments

### AI Chat

- `POST /api/ai/chat` - Send message to AI
- `GET /api/ai/history` - Get chat history

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Team collaboration and dedication
- Open source libraries and frameworks
- AI integration capabilities
- Community feedback and support

---

**Built with ❤️ by the Social Blogging App Team**
