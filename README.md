

# Studio One AI

### The Multimodal Movie Engine

*Talk to your AI Director. Watch your movie come to life.*

[![Gemini Live Agent Challenge](https://img.shields.io/badge/Hackathon-Gemini%20Live%20Agent%20Challenge-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://geminiliveagentchallenge.devpost.com/)
[![Category](https://img.shields.io/badge/Category-Creative%20Storyteller%20%E2%9C%8D%EF%B8%8F%20%2B%20Live%20Agent%20%F0%9F%97%A3%EF%B8%8F-FF6F00?style=for-the-badge)](#)
[![Google Cloud](https://img.shields.io/badge/Hosted%20on-Google%20Cloud-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white)](#)

</div>

---

## Project Timeline

| Milestone                | Date & Time                         | Status   |
| ------------------------ | ----------------------------------- | -------- |
| **Project Kickoff**      | March 13, 2026 — 3:30 PM EDT       | Started |
| **Submission Deadline**  | March 16, 2026 — 5:00 PM PT (8:00 PM EDT) | 3 days |
| **Judging Period**       | March 17 – April 3, 2026           | Upcoming |
| **Winners Announced**    | Google Cloud Next — April 22–24, 2026 | --       |


---

## Project Vision

**Studio One AI** is an all-in-one AI movie studio powered by Google's Gemini ecosystem. It transforms filmmaking from a complex, multi-tool workflow into a single conversational experience — you simply *talk* to your AI Director, and it writes the script, generates storyboards, produces cinematic video clips, and stitches everything into a finished movie.

### The Problem
Creating even a short film today requires mastering separate tools for writing, storyboarding, image generation, video production, and editing. There's no unified, voice-driven creative pipeline.

### The Solution
Studio One AI collapses that entire pipeline into one browser-based studio where:
- You **talk** to your Director (Gemini Live API)
- It **writes** and structures your script in real-time (Firestore)
- It **generates** consistent characters and storyboards (Gemini Image Generation)
- It **produces** cinematic clips from your scenes (Veo 3.1)
- It **exports** a finished movie, assembled and rendered

---

## Google Services Used

| Service | Purpose |
| --- | --- |
| **Gemini 2.0 (Live API)** | Real-time voice conversation with the AI Director — supports natural dialogue, interruptions, and multimodal understanding |
| **Gemini API (Text Generation)** | AI-powered script writing, scene extraction, and structured content generation with JSON schema enforcement |
| **Gemini Image Generation** | Character visual generation and scene storyboard creation (Imagen / `gemini-2.0-flash-preview-image-generation`) |
| **Veo 3.1 / Veo 3.0 / Veo 2.0** | Cinematic video clip generation from scene descriptions and storyboard images — multiple model tiers for quality vs. speed |
| **Firebase Authentication** | Google Sign-In for user accounts and session management |
| **Cloud Firestore** | Real-time NoSQL database for projects, scripts, chapters, scenes, characters, video clips, and all pipeline data |
| **Firebase Storage** | Asset storage for generated images, character visuals, storyboards, and video clips |
| **Firebase Hosting** | Production deployment of the Next.js application |

---

## Architecture Overview

### System Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                       STUDIO ONE AI — BROWSER                           │
│   Next.js 16 (App Router) · React 19 · TypeScript · Tailwind · Shadcn  │
└──────────────┬────────────────────────┬──────────────────────┬──────────┘
               │                        │                      │
    ┌──────────▼──────────┐  ┌──────────▼──────────┐  ┌───────▼─────────┐
    │   NEXT.JS API       │  │   FIREBASE SDK      │  │  GEMINI LIVE    │
    │   ROUTES            │  │   (Client-side)     │  │  API            │
    │                     │  │                     │  │                 │
    │ • /api/ai/*         │  │ • Firestore CRUD    │  │ • Voice conv.   │
    │ • Text generation   │  │ • Auth state        │  │ • Real-time     │
    │ • Image generation  │  │ • Storage uploads   │  │ • Multimodal    │
    │ • Video generation  │  │                     │  │                 │
    │ • Video polling     │  │                     │  │                 │
    └──────────┬──────────┘  └──────────┬──────────┘  └─────────────────┘
               │                        │
    ┌──────────▼──────────┐  ┌──────────▼──────────┐
    │  GOOGLE AI          │  │  FIREBASE            │
    │                     │  │                      │
    │ • Gemini 2.0        │  │ • Firestore DB       │
    │ • Imagen            │  │ • Cloud Storage      │
    │ • Veo 3.1/3.0/2.0   │  │ • Authentication     │
    └─────────────────────┘  └──────────────────────┘
```

### Frontend Architecture

The application follows a **feature-based modular architecture**:

```
src/
├── app/                          # Next.js App Router
│   ├── (public)/                 # Public marketing pages
│   ├── (studio)/                 # Authenticated studio workspace
│   │   └── studio/[id]/          # Individual project pages
│   └── api/ai/                   # Server-side AI API routes
│       ├── generate-text/        # Gemini text generation
│       ├── generate-image/       # Gemini image generation
│       ├── generate-scene-images/# Scene storyboard generation
│       ├── generate-character-visuals/ # Character image generation
│       ├── generate-video-clip/  # Veo video generation
│       ├── generate-music/       # Music generation
│       ├── generate-project-poster/ # Movie poster generation
│       └── poll-video-operation/ # Async video generation polling
│
├── features/                     # Feature modules
│   ├── ai/                       # AI service layer
│   │   ├── services/             # Google GenAI SDK integration
│   │   └── hooks/                # AI mutation hooks
│   ├── auth/                     # Authentication (Firebase Auth)
│   ├── projects/                 # Core project pipeline
│   │   ├── components/
│   │   │   ├── steps/            # Pipeline step components
│   │   │   │   ├── script-step   # Script writing & chapters
│   │   │   │   ├── characters-step # Character management
│   │   │   │   ├── scenes-step   # Scene extraction & editing
│   │   │   │   ├── generate-step # Video clip generation
│   │   │   │   ├── edit-step     # Timeline editor (coming soon)
│   │   │   │   └── export-step   # Movie export (coming soon)
│   │   │   ├── script/           # Script sub-components
│   │   │   ├── scenes/           # Scene sub-components
│   │   │   └── generate/         # Generation sub-components
│   │   ├── hooks/                # TanStack Query + UI state hooks
│   │   ├── services/             # Firebase Firestore CRUD
│   │   ├── types/                # TypeScript interfaces
│   │   └── constants/            # Config values & defaults
│   └── settings/                 # User settings
│
├── components/
│   ├── ui/                       # Shadcn UI components (41 components)
│   └── shared/                   # Shared app-level components
│
└── lib/
    ├── firebase.ts               # Firebase client init
    ├── genai.ts                  # Google GenAI client init
    └── genai-server.ts           # Server-side GenAI init
```

### Pipeline Steps

Each project follows a **6-step creative pipeline**:

| Step | Status | Description |
| --- | --- | --- |
| **1. Script** | ✅ Active | Write and structure your screenplay into chapters with AI assistance |
| **2. Characters** | ✅ Active | Define characters with AI-generated visual references |
| **3. Scenes** | ✅ Active | Extract and manage scenes with locations, times, and visual descriptions |
| **4. Generate** | ✅ Active | Produce cinematic video clips using Veo 3.1/3.0/2.0 from scene storyboards |
| **5. Edit** | 🔜 Coming Soon | Timeline editor for arranging and trimming clips |
| **6. Export** | 🔜 Coming Soon | Final movie export with custom settings |

### Tech Stack

| Layer | Technology |
| --- | --- |
| **Framework** | Next.js 16 (App Router) |
| **UI** | React 19, TypeScript, Tailwind CSS, Shadcn UI |
| **State** | Zustand (client state), TanStack Query (server state) |
| **Backend** | Firebase (Firestore, Auth, Storage) |
| **AI** | Google GenAI SDK (`@google/genai`) |
| **Notifications** | Sonner (toast system) |

---

## Hackathon Alignment

### Categories Targeted
| Category | Fit |
| --- | --- |
| **Creative Storyteller** | Primary — Studio One is a multimodal creative director that interleaves text, images, audio, and video into a cohesive filmmaking flow. |
| **Live Agents** | Secondary — The core UX is a real-time, voice-driven conversation with the Gemini Live API, supporting natural dialogue and interruptions. |


### Mandatory Tech Stack
- [x] **Gemini Model** — Gemini 2.0 (Live API for voice/vision)
- [x] **Google GenAI SDK / ADK** — Agent orchestration and tool registration
- [x] **Google Cloud** — Cloud Run (frontend + stitching microservice), Firestore, Cloud Storage
- [x] **Image Generation** — Gemini Image (`gemini-2.0-flash-preview-image-generation`)
- [x] **Video Generation** — Veo 3.1 / 3.0 / 2.0 APIs
