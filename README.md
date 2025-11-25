# 🦷 DentAssist-LK

### **AI-Powered Dental Appointment Booking System **

DentAssist-LK is a full-stack web application for booking dental appointments online.

This project is **inspired by a YouTube tutorial**, but completely **rebuilt by me from scratch** with my own architecture decisions, additional features, and improvements—including global state management, webhook integrations, database enhancements, appointment validation, and custom backend logic.

This is a **personal learning and portfolio project**, and all integrations (Clerk subscription, Vapi voice, Resend emails) are used **only for testing purposes**, not real production billing.

---

## 📚 Documentation

- **Architecture Diagram** → `ARCHITECTURE_DIAGRAM.excalidraw`
---

## 🚀 Quick Start

### **Prerequisites**
- Node.js 20+
- PostgreSQL database (Neon / Supabase / Railway)
- Clerk account (for authentication)
- Resend account (for emails)

### **Installation**

```bash
npm install

npx prisma migrate dev
npx prisma generate

npm run dev
````

Project runs at:

👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🛠️ Tech Stack

### **Frontend & App**

* Next.js 15 (App Router)
* React 19
* Tailwind CSS 4
* Shadcn/UI + Radix UI
* TypeScript 5

### **State Management**

* Zustand (client state)
* TanStack Query (server caching)

### **Backend**

* Next.js server actions
* Prisma ORM
* PostgreSQL

### **Integrations**

* Clerk (Authentication)
* Resend (Email service)
* Vapi.ai (AI Voice Assistant — testing only)

---

## ✨ Features Implemented by Me

Although the UI concept was inspired by YouTube, all functionality and improvements were implemented **independently by me**.

### ✔️ Core Features

* Multi-step appointment booking flow
* Real-time doctor availability
* Appointment confirmations via email
* Admin dashboard (doctors, appointments, stats)
* Clerk-based authentication & roles (Admin / User)

### ✔️ My Custom Improvements

* Global state management using Zustand
* Webhook handlers for Clerk & Resend
* Custom Prisma schema + improved DB relations
* Appointment conflict validation
* Clean folder structure with reusable utilities
* Fully responsive UI refinements

---

## 📁 Project Structure

```
src/
├── app/               # Next.js App Router
├── components/        # UI components
├── hooks/             # Custom hooks
├── lib/               # Utilities & server actions
├── store/             # Zustand stores
└── middleware.ts      # Auth middleware
```

---

## 🔐 Environment Variables

Create a `.env` file based on `.env.example`.

Required:

* `DATABASE_URL`
* `CLERK_SECRET_KEY`
* `RESEND_API_KEY`
* `VAPI_API_KEY` (optional)

> **Note:** All payments/subscriptions are for **testing only** and not intended for real transactions.

---

## 🚀 Deployment

### **Deploy to Vercel**

```bash
npm run build
vercel deploy
```

Make sure to configure all environment variables inside Vercel.

### **Recommended PostgreSQL Providers**

* Supabase
* Neon
* Railway

---

## 🧪 Development Commands

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm start         # Run production build

# Prisma commands
npx prisma migrate dev
npx prisma generate
npx prisma studio
```

---

## 🤝 Contributing

This is a personal portfolio project, but contributions are welcome.

---

## 📄 License

Private project — All rights reserved.

---

## 👤 Author

**DentAssist-LK Development**

```

