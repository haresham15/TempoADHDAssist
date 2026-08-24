# Tempo: Intent-Driven Support for ADHD

Tempo is an AI-powered digital therapeutic tool designed specifically for the ADHD brain. Unlike traditional productivity apps that rely on high-friction data entry and guilt-based gamification, Tempo uses an intent-driven interface to lower cognitive load. 

It leverages high-speed, cost-efficient Large Language Models (LLMs) to address three core pillars of ADHD struggles: Rejection Sensitive Dysphoria (RSD), executive dysfunction (task paralysis), and social/emotional burnout.

## Core Features

- **🧩 Task Chunker (Executive Dysfunction)**: Uses DeepSeek to break down broad, overwhelming tasks into 3-5 highly actionable, immediate physical micro-steps.
- **🛡️ Communication Buffer (RSD)**: Analyzes emotionally charged messages (received or drafted) using DeepSeek CBT protocols to extract an emotionally neutral translation and flag cognitive distortions.
- **🎙️ Safe Venting Space (Emotional Burnout)**: A voice-first journal using Gemini Multimodal AI. It provides a judgment-free zone to vent, offering short, validating responses without unsolicited advice.

## Architecture & Tech Stack

Tempo is built with a highly efficient, serverless architecture optimized for a solo builder:
- **Framework**: [Next.js (App Router)](https://nextjs.org/)
- **Styling**: Vanilla CSS with premium glassmorphism aesthetics.
- **AI Models**: [DeepSeek](https://deepseek.com) (Text/Reasoning) and [Google Gemini 1.5 Flash](https://deepmind.google/technologies/gemini/) (Multimodal Audio).
- **Backend**: Native Next.js API Routes (Serverless Functions) integrated with `maxDuration` scaling.
- **Database / Auth**: [Supabase](https://supabase.com/) (Scaffolded and ready for expansion).

## Getting Started Locally

### 1. Clone the repository
```bash
git clone https://github.com/haresham15/TempoADHDAssist.git
cd TempoADHDAssist
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory and add the following keys:
```env
# AI Models
DEEPSEEK_API_KEY=your_deepseek_api_key
GEMINI_API_KEY=your_gemini_api_key

# Supabase (Optional for V1 MVP, required for Auth/DB features)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to interact with the app.

## Production Deployment

This project is optimized for deployment on Vercel's free tier. 
1. Push your code to GitHub.
2. Import the repository in your Vercel Dashboard.
3. Paste the environment variables from your `.env.local` file into Vercel's Environment Variables settings.
4. Deploy! 

*Note: The API routes (`/api/chunk-task`, `/api/rsd-buffer`, `/api/vent`) are configured with `export const maxDuration = 60;` to ensure AI requests do not timeout under Vercel's default 10-15s serverless limits.*
