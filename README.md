

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
- It **generates** consistent characters and storyboards (Nano Banana 2 / Gemini Image)
- It **produces** cinematic clips from your scenes (Veo 3.1)
- It **exports** a finished movie, assembled and rendered (FFmpeg on Cloud Run)

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
- [x] **Image Generation** — Gemini Image (Nano Banana 2 / `gemini-3.1-flash-image-preview`)
- [x] **Video Generation** — Veo 3.1 API

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    STUDIO ONE AI — BROWSER                  │
└─────────────────────┬───────────────────────┬───────────────┘
                      │                       │
              ┌───────▼───────────────────────▼────────┐
              │         NEXT.JS BACKEND (API)          │
              │  • ADK Agent Orchestration             │
              │  • Tool Registry (updateScript,        │
              │    manageChapters, generateImage,       │
              │    generateVideo, exportMovie)          │
              └───────┬───────────┬───────────┬────────┘
                      │           │           │
           ┌──────────▼──┐ ┌─────▼─────┐ ┌───▼──────────────┐
           │  Firestore  │ │  Cloud    │ │  Cloud Run       │
           │  (Scripts,  │ │  Storage  │ │  Stitching       │
           │  Chapters,  │ │  (Assets) │ │  Service (FFmpeg)│
           │  Scenes)    │ │           │ │                  │
           └─────────────┘ └───────────┘ └──────────────────┘
```
