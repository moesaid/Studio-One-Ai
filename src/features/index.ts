/**
 * Feature modules directory.
 *
 * Each feature should follow this structure:
 *   src/features/[feature-name]/
 *   ├── components/
 *   ├── hooks/
 *   │   ├── use-[feature]-query.ts   — TanStack Query hooks
 *   │   ├── use-[feature].ts         — UI state (modals, forms, search)
 *   │   └── index.ts
 *   ├── services/
 *   │   ├── [feature]-api.ts         — API calls + mock fallback
 *   │   ├── mock-data.ts
 *   │   └── index.ts
 *   ├── types/
 *   │   └── index.ts                 — Interfaces only, no runtime values
 *   └── constants/
 *       └── index.ts                 — Const values only, no type defs
 */
export {};
