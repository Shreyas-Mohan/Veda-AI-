# 🌌 VedaAI - Smart Assessment Creator

VedaAI is a sophisticated AI-powered platform designed for educators to generate high-quality and professional question papers within minutes.
It provides a smooth 3-step workflow, real-time AI generation tracking, and beautifully formatted ready-to-print assessment papers.

---

# ✨ Features

* **3-Step Assessment Wizard**

  * Configure question types
  * Add AI instructions/context
  * Generate final paper

* **Professional Output**

  * School-style exam paper formatting
  * Clean and printable layout

* **Light & Dark Mode**

  * Modern glassmorphic responsive UI

* **Background AI Processing**

  * Uses BullMQ + Redis for queue handling
  * Automatic fallback support for zero-config environments

* **Print & PDF Ready**

  * Optimized A4 paper styling
  * Direct print/download support

* **Modern Frontend Experience**

  * Fast and responsive UI
  * Toast notifications and smooth interactions

---

# 🚀 Quick Start

The project already contains sandbox credentials for MongoDB Atlas and Redis, so no extra environment setup is required for testing.

---

## 1️⃣ Clone Repository

```bash
git clone https://github.com/Shreyas-Mohan/Veda-AI-.git
cd Veda-AI-
```

---

## 2️⃣ Start Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on:

```bash
http://localhost:5001
```

---

## 3️⃣ Start Frontend

```bash
cd ../frontend
npm install
npm run dev
```

Frontend runs on:

```bash
http://localhost:3000
```

---

# 🛠️ Tech Stack

## Frontend

* Next.js 15 (Turbopack)
* Tailwind CSS 4
* Zustand
* Lucide Icons
* React Hot Toast

## Backend

* Node.js
* Express.js
* TypeScript
* Mongoose

## Database & Queue

* MongoDB Atlas
* Redis
* BullMQ

---

# 📸 Workflow

## Step 1 — Configure

Select question types such as:

* MCQ
* Short Answer
* Long Answer

Assign marks and sections accordingly.

---

## Step 2 — Add Context

Provide AI instructions like:

```text
Focus on Photosynthesis for Grade 5 students
```

You can customize:

* Difficulty level
* Topic focus
* Question style
* Additional constraints

---

## Step 3 — Generate

The AI processes the assessment paper in the background and generates a structured exam paper.

---

## Step 4 — Print / Download

Preview the final paper and:

* Print directly
* Save as PDF
* Use A4 optimized formatting

---

# 📁 Project Structure

```bash
Veda-AI-/
├── backend/
│   ├── src/
│   │   ├── config/       # Database & Redis configuration
│   │   ├── models/       # MongoDB Schemas
│   │   ├── routes/       # API & AI processing routes
│   │   ├── queue/        # BullMQ queue logic
│   │   └── server.ts
│
└── frontend/
    ├── src/
    │   ├── app/          # App Router
    │   ├── components/   # Reusable UI components
    │   ├── store/        # Zustand global state
    │   └── styles/
```

---

# 🌟 Highlights

* Hackathon-ready architecture
* Clean modular code structure
* Zero-config startup
* Fast AI workflow
* Production-style UI/UX
* Responsive design
* Ready for deployment

---

# 📝 License

Created for the **Veda AI Hackathon**.

Feel free to explore, improve, and build upon the project.
