BachatVaani 🪙

Voice-Based Micro Savings Platform for India's Informal Workforce

BachatVaani is a voice-enabled financial inclusion platform designed for daily wage workers, street vendors, farm workers, and informal sector employees. The platform allows users to save small amounts of money using simple voice commands, helping them build financial discipline without requiring advanced digital literacy.

---

Problem Statement

Millions of informal workers in India have bank accounts but struggle to save money consistently due to:

- Irregular daily income
- Low digital literacy
- Limited access to smartphones
- Lack of simple savings tools

Without structured savings, many households remain vulnerable to emergencies and debt.

---

Solution

BachatVaani provides a simple voice-first savings experience.

Users can:

- Register and manage their account
- Save money using voice commands
- Track savings progress
- Monitor savings goals
- View transaction history
- Receive financial literacy guidance
- Build consistent saving habits through rewards and streaks

The platform is designed to be simple, accessible, and scalable.

---

Key Features

Voice Assistant

- Voice-based savings commands
- Balance inquiry
- Navigation assistance
- Hindi and English support

Savings Management

- Add savings transactions
- Withdraw funds
- Transaction history
- Savings analytics

Goals & Progress Tracking

- Create savings goals
- Track completion progress
- Goal-based planning

Impact Calculator

- Daily savings projection
- Monthly savings forecast
- Yearly savings forecast
- Long-term financial planning

Gamification

- Savings streaks
- Achievement badges
- Progress milestones

Analytics Dashboard

- Total savings overview
- Monthly trends
- Savings insights
- Performance tracking

Admin Dashboard

- User management
- Savings monitoring
- Analytics reporting
- Content management

---

Technology Stack

Frontend

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Shadcn UI
- Framer Motion

Backend

- Next.js API Routes
- TypeScript

Database

- PostgreSQL
- Prisma ORM
- Neon Database

Authentication

- JWT Authentication
- Secure Cookies
- PIN-Based Verification

Voice Processing

- Web Speech API
- Browser Speech Recognition

Deployment

- Vercel
- GitHub

---

System Architecture

User Interface

↓

Voice Processing Layer

↓

Application Services

↓

Authentication Layer

↓

Database Layer

↓

Analytics & Reporting

---

Security Features

- JWT-based authentication
- Secure password and PIN handling
- Environment variable protection
- Database access control
- Input validation
- Secure API routes
- CORS configuration
- Production-ready deployment settings

---

Project Structure

src/
├── app/
├── components/
├── lib/
├── hooks/
├── services/
├── types/

prisma/
public/
docs/

---

Local Setup

Clone Repository

git clone <repository-url>
cd BACHAT-VAANI

Install Dependencies

npm install

Configure Environment

Copy:

.env.example

Create:

.env

Fill required values.

Database Setup

npx prisma db push

Start Development Server

npm run dev

Application runs at:

http://localhost:3000

---

Environment Variables

Required variables are documented in:

.env.example

Never commit actual secrets to GitHub.

---

Deployment

Recommended Platform:

- Vercel

Deployment Steps:

1. Connect GitHub repository
2. Configure environment variables
3. Deploy application
4. Verify database connectivity
5. Test voice features

---

Future Roadmap

- Regional language expansion
- Voice biometrics
- Advanced fraud detection
- Financial coaching assistant
- Banking integrations
- Mobile application
- Offline-first experience

---

Impact

BachatVaani aims to improve financial inclusion by making savings accessible to underserved communities through intuitive voice-based interactions.

Small daily savings can create long-term financial security and reduce dependence on informal borrowing.

---

Team

Team Name

CodeV

Team Members

- Ayush Bhardwaj
- Md. Shagauf Neyazi

---

Hackathon

Developed for:

Bharat Academix CodeQuest Hackathon 2026

Theme:
Artificial Intelligence • Machine Learning • Web Development • Social Impact
