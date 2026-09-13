# AviX
AviX (Genius.ai) is a state-of-the-art Omnimodal SaaS (Software as a Service) platform developed uniting five generative AI tools into a single, seamless workspace.
AviX can be used as a daily creative and technical powerhouse that elevates productivity with conversational reasoning, full-stack code generation, hyper-realistic image synthesis, studio-quality music composition, and cinematic video rendering.

**Project Demo Link:** https://youtu.be/oM1PlYCPZS8

**Project Link:** https://avixgenius.vercel.app/

<br>

## Key Features

- **Omnimodal Workspace :** AviX consolidates all AI capabilities into a single, unified chat interface—eliminating the need to juggle 5 separate tool subscriptions. Switch between conversations, code requests, image creation, music tracks, and video clips seamlessly in one window with persistent multi-thread history.

- **Conversation :** Powered by Google's Gemini reasoning engine, AviX delivers context-aware, multi-turn conversational intelligence. It supports rich Markdown formatting, interactive tables with 1-click TSV copying, task list checkboxes, and KaTeX mathematical formula rendering.

- **Code Generation :** AviX leverages advanced LLM capabilities to synthesize, review, refactor, and debug production-grade code across 40+ programming languages. Outputs feature clean syntax highlighting, language badges, and instantaneous one-click clipboard copying.

- **Image Generation :** AviX integrates state-of-the-art diffusion models via Replicate and Google Imagen to produce hyper-realistic photographs, digital artwork, and marketing visuals from descriptive text prompts, complete with high-resolution download capabilities.

- **Music Generation :** Powered by neural audio synthesis (Stable Audio via Replicate), users can compose original soundtracks, ambient lo-fi tracks, and soundscapes tailored to custom vibes and moods, played directly via an embedded custom audio player.

- **Video Generation :** AviX utilizes cutting-edge video synthesis models (such as Gen-2 via Replicate) to render dynamic cinematic video clips from text prompts, featuring native video controls, duration indicators, and instant MP4 downloads.

- **Persistent Cloud Media Storage :** Generated media assets are automatically persisted with Cloudinary integration and reliable local fallbacks, ensuring outputs remain permanently accessible across devices and sessions.

- **User Authentication & Privacy :** Built with Clerk, AviX provides secure authentication with social OAuth (Google), email sign-in, multi-factor security, custom dark themes, and multi-layered identity protection.

- **Stripe Subscription & Usage Tracking :** Seamless billing management with Stripe integration. Free tier users receive 5 complimentary generations, with real-time progress tracking and an upgrade flow to AviX Pro for unlimited generations.

<br>

## Tech Stack
AviX is smooth, sharp looking, and a multi-functioning modern platform built to operate with effortless speed. AviX works seamlessly across desktop, tablet, and mobile devices with a fully responsive layout, collapsible sidebar rails, and mobile drawer navigation.

Following technologies are used to build AviX:

- **Next.js 14 :** Next.js is a React-based full-stack framework leveraging App Router, React Server Components, and optimized API Route Handlers, delivering sub-second response times, server-side rendering, and SEO excellence.

- **React 18 :** React is the industry-standard UI library powering AviX's component-based frontend architecture, utilizing modern hooks and concurrent rendering for smooth interactivity.

- **TypeScript :** TypeScript provides strict static typing across the entire codebase, eliminating runtime errors, ensuring bulletproof type safety, and improving maintainability.

- **Tailwind CSS :** Tailwind CSS is a utility-first CSS framework coupled with Radix UI primitives that powers AviX's modern dark theme, glowing aurora effects, glassmorphic cards, and micro-interactions.

- **Google Generative AI (Gemini) :** The Gemini API powers AviX's high-speed conversational reasoning and multi-language code generation with deep contextual awareness.

- **Replicate API :** Replicate provides scalable cloud inference for neural AI models powering photo-realistic image synthesis, audio track composition, and cinematic video rendering.

- **Prisma ORM :** Prisma is a next-generation Object-Relational Mapping (ORM) tool providing type-safe database queries, declarative schema migrations, and smooth relation handling.

- **PostgreSQL :** PostgreSQL serves as the primary relational database, storing user generation limits, active Stripe subscriptions, conversation threads, and chat message history.

- **Cloudinary :** Cloudinary provides resilient cloud asset management, media optimization, and permanent storage for generated images, audio files, and video clips.

- **Clerk :** Clerk simplifies authentication, user session security, and account profile management with out-of-the-box OAuth, session tokens, and custom dark theme styling.

- **Stripe :** Stripe handles payment processing, customer billing portals, checkout sessions, and webhook lifecycle events for AviX Pro subscriptions.

- **Zustand :** Zustand provides lightweight, scalable client state management for active generation tracking and chat synchronization across tabs.

<br>

## Snapshots of AviX:

### Home Page
![image](https://github.com/Avinash0308/AviX/blob/main/ReadMe_Images/HomePage.png)
<br>
![image](https://github.com/Avinash0308/AviX/blob/main/ReadMe_Images/Testimonials.png)

### User Authentication
![image](https://github.com/Avinash0308/AviX/blob/main/ReadMe_Images/UserAuthentication.png)

### Dashboard
![image](https://github.com/Avinash0308/AviX/blob/main/ReadMe_Images/Dashboard.png)

### Conversation Feature
![image](https://github.com/Avinash0308/AviX/blob/main/ReadMe_Images/Conversation.png)

### Image Generation
![image](https://github.com/Avinash0308/AviX/blob/main/ReadMe_Images/Image.png)

### Video Generation
![image](https://github.com/Avinash0308/AviX/blob/main/ReadMe_Images/Video.png)

### Music Generation
![image](https://github.com/Avinash0308/AviX/blob/main/ReadMe_Images/Music.png)

### Code Generation
![image](https://github.com/Avinash0308/AviX/blob/main/ReadMe_Images/Code.png)

### User Account
![image](https://github.com/Avinash0308/AviX/blob/main/ReadMe_Images/Account.png)

### Upgrade Pop-Up
![image](https://github.com/Avinash0308/AviX/blob/main/ReadMe_Images/Upgrade.png)

### Payment Gateway
![image](https://github.com/Avinash0308/AviX/blob/main/ReadMe_Images/Payment.png)

<br>

## Prerequisites

### Install Node.js
Refer to https://nodejs.org/ to install Node.js (v18.17.0 or higher recommended).

### Database Setup
Ensure you have access to a **PostgreSQL** database instance (locally or hosted on Neon, Supabase, etc.).

### API Keys
Prepare the following API credentials:
- **Clerk:** Publishable Key & Secret Key
- **Google Gemini:** API Key
- **Replicate:** API Token
- **Stripe:** API Key & Webhook Secret
- **Cloudinary (Optional):** Cloud Name, API Key, API Secret

<br>

## Cloning and Running the Application in Local

1. **Clone the project into local:**
```bash
git clone https://github.com/Avinash0308/AviX.git
cd AviX
```

2. **Install all dependencies:**
```bash
npm install
```

3. **Configure Environment Variables:**
Create a `.env.local` file in the root directory by copying `.env.example`:
```bash
cp .env.example .env.local
```
Fill in your respective API keys and PostgreSQL connection string:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

API_KEY=
REPLICATE_API_TOKEN=

DATABASE_URL="postgresql://user:password@localhost:5432/avix"

STRIPE_API_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_APP_URL="http://localhost:3000"

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

4. **Sync Database Schema:**
Generate the Prisma Client and push your database schema:
```bash
npx prisma generate
npx prisma db push
```

5. **Start the Development Server:**
```bash
npm run dev
```

The Application runs on **http://localhost:3000**

<br>

# Thanks💖
