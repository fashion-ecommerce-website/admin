# 🛍️ Fashion Admin Dashboard

Admin panel for Fashion E-commerce platform built with Next.js 15, TypeScript, and Redux Toolkit.

## ✨ Features

- 🔒 **Admin Authentication**: Secure login with role-based access control
- 📊 **Dashboard**: Real-time statistics and analytics
- 👥 **User Management**: Manage customer accounts and permissions
- 📦 **Product Management**: CRUD operations for products and categories
- 🛒 **Order Management**: View and process customer orders
- 📈 **Analytics**: Sales reports and business insights
- 🎨 **Modern UI**: Clean admin interface with Tailwind CSS

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server (port 3001)
npm run dev
```

The admin dashboard will be available at `http://localhost:3001`

## 🏗️ Architecture

This project follows the same self-contained feature architecture as [Frontend-Customer](../Frontend-Customer/README.md):

```
src/
├── app/                    # Next.js App Router pages
├── components/             # Shared components
│   └── layout/            # Layout components
├── features/              # Self-contained feature modules
│   ├── auth/
│   │   └── login/
│   │       ├── components/    # UI components
│   │       ├── containers/    # Business logic containers
│   │       └── redux/        # State management
│   ├── dashboard/
│   └── user-management/
├── hooks/                 # Custom React hooks
├── providers/            # Context providers
├── services/            # API services
├── store/              # Redux store configuration
└── utils/             # Utility functions
```

## 🔗 API Integration

The admin panel integrates with the backend API endpoints:

- **Authentication**: `/api/admin/auth/*`
- **Dashboard**: `/api/admin/dashboard/*`
- **User Management**: `/api/admin/users/*`
- **Product Management**: `/api/admin/products/*`
- **Order Management**: `/api/admin/orders/*`

## 🔐 Admin Permissions

- **ADMIN**: Basic admin permissions
- **SUPER_ADMIN**: Full system access

## 🔗 Related Projects

- **Backend**: [Backend/README.md](../Backend/README.md)
- **Customer Frontend**: [Frontend-Customer/README.md](../Frontend-Customer/README.md)

## 🛠️ Development

```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## 🌐 Ports

- **Admin Dashboard**: `http://localhost:3001`
- **Customer Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:8080`
