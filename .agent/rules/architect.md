---
trigger: always_on
---

# Activation: Always On

You are the Senior Full-Stack Architect for the "Duha" B2B platform. You must follow these architectural constraints for all code generation and refactoring tasks.

## 1. Modular Directory Structure
Always organize the project by feature. 
- **Core Path:** `src/features/[feature-name]/`
- **Sub-folders:** Each feature must have `components/`, `hooks/`, `services/`, `types/`, and `constants/`.
- **Global UI:** Only truly generic components (like a basic Button) go in `src/components/ui/`.

## 2. Technical Stack Standards
- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, Shadcn UI.
- **State:** Use **Zustand** for global client-side state and **TanStack Query** for server-state fetching.
- **Backend:** Laravel REST API (Sanctum/Spatie). Expect JSON responses with standard error codes.

## 3. UI Component Priority (Shadcn First)
**ALWAYS check for existing Shadcn UI components before building from scratch.**
- **Available components:** `src/components/ui/` contains 41 Shadcn components:
  accordion, alert, alert-dialog, aspect-ratio, avatar, badge, breadcrumb, button, calendar, card, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, form, hover-card, input, label, menubar, navigation-menu, pagination, popover, progress, radio-group, scroll-area, select, separator, sheet, skeleton, slider, sonner, switch, table, tabs, textarea, toggle, toggle-group, tooltip.
- **Reference:** Check `/dashboard/design-system` page for live component examples.
- **Compose first:** Combine existing Shadcn components before creating custom ones.
- **Custom only when necessary:** Only create custom components when Shadcn doesn't provide the needed functionality.

## 4. Security & Access Control
- All dashboard UI elements must be wrapped in the `<PermissionGuard />` component if they require specific roles.
- Use the `usePermission` hook to verify access programmatically.
- Protected routes must be defined in `src/app/middleware.ts`.

## 5. API Client Pattern
- All API calls must use the centralized `axios` instance in `src/lib/api-client.ts`.
- Always include error handling for `401` (Unauthorized) and `403` (Forbidden) by triggering the logout action in the Zustand store.

## 6. Coding Style
- Prefer Functional Components and standard React hooks.
- Every API response must have a corresponding TypeScript interface in `src/types/api.d.ts`.

## 7. Environment Variables & Mock Data
- **Never use `process.env.NODE_ENV`** directly. Use `NEXT_PUBLIC_IS_PRODUCTION` from `.env` instead.
- **Mock Data Pattern:** In hooks/services that need mock data fallback, use this consistent pattern:
  ```typescript
  const USE_MOCK_DATA = process.env.NEXT_PUBLIC_IS_PRODUCTION !== 'true';
  ```
- When `NEXT_PUBLIC_IS_PRODUCTION` is `'true'`, real API calls are made. Otherwise, mock data is used.
- This allows development without a backend while keeping a single toggle for production.

## 8. Feature Hooks & Services Separation (CRITICAL)

Each feature MUST follow this exact file structure and separation of concerns:

### Services (`src/features/[feature]/services/`)
| File | Purpose |
|------|---------|
| `[feature]-api.ts` | API service functions using `apiClient`, mock data logic with `withMockFallback` helper |
| `mock-data.ts` | Mock data for development |
| `index.ts` | Export all services |

**API Service Pattern:**
```typescript
import apiClient from '@/lib/api-client';
import { mockData } from './mock-data';

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_IS_PRODUCTION !== 'true';

async function withMockFallback<T>(apiCall: () => Promise<T>, mockData: () => T): Promise<T> {
    if (!USE_MOCK_DATA) return apiCall();
    try { return await apiCall(); }
    catch { return mockData(); }
}

export async function getData(): Promise<Response> {
    return withMockFallback(
        async () => { const res = await apiClient.get('/endpoint'); return res.data; },
        () => ({ data: mockData })
    );
}
```

### Hooks (`src/features/[feature]/hooks/`)
| File | Purpose |
|------|---------|
| `use-[feature]-query.ts` | TanStack Query hooks for data fetching/mutations + toast notifications |
| `use-[feature].ts` | UI state management (modals, forms, search, formatters) |
| `index.ts` | Export all hooks |

**Query Hook Pattern (use-[feature]-query.ts):**
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as api from '../services/[feature]-api';

export const queryKeys = { all: ['feature'], list: () => [...queryKeys.all, 'list'] };

export function useDataQuery() {
    return useQuery({ queryKey: queryKeys.list(), queryFn: api.getData, staleTime: 5 * 60 * 1000 });
}

export function useCreateMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.createData,
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.list() }); toast.success('Created'); },
        onError: () => { toast.error('Failed'); },
    });
}
```

**UI State Hook Pattern (use-[feature].ts):**
```typescript
import { useState, useCallback, useMemo } from 'react';

export function useFeature() {
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({});
    
    const openModal = useCallback(() => setModalOpen(true), []);
    const closeModal = useCallback(() => setModalOpen(false), []);
    const formatCurrency = useCallback((n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n), []);
    
    return { modalOpen, formData, setFormData, openModal, closeModal, formatCurrency };
}
```

### Key Rules
1. **Mock data logic stays in services** - never in hooks
2. **Query hooks only call API functions** - no mock logic, no local state
3. **UI hooks handle local state** - modals, forms, search, formatters
4. **Always use toast notifications** in mutation onSuccess/onError
5. **API responses must wrap data** in `{ data: ... }` format
6. **Page components only compose** - no inline data, hardcoded arrays, or content that could come from API

## 9. Shared Help Components (Page Header Help Buttons)

**ALWAYS use the shared Help components for page-level help buttons and modals.**

- **Location:** `src/components/shared/help/`
- **Components:** `HelpButton`, `HelpDialog`, and `HelpContent` type
- **Usage:** When adding a Help button to a page header, use the shared `HelpButton` component with page-specific `HelpContent`.

**Pattern:**
```typescript
import { HelpButton, type HelpContent } from '@/components/shared/help';

// Define page-specific help content
const pageHelpContent: HelpContent = {
    title: 'Page Help',
    description: 'Learn how to use this feature',
    videos: [
        { id: '1', title: 'Tutorial', description: '...', thumbnail: '...', url: '...', duration: '4:00' },
    ],
    faqs: [
        { id: '1', question: 'How do I...?', answer: 'You can...' },
    ],
};

// Use in page header
usePageHeader({
    title: 'Page Title',
    subtitle: 'Section',
    actions: <HelpButton content={pageHelpContent} variant="ghost" />,
});
```

**Rules:**
1. **Never create feature-specific TutorialsModal components** - always use the shared `HelpButton`
2. **Define `HelpContent` in the page file** - keeps content co-located with the page
3. **Use `variant="ghost"`** for page header help buttons for consistent styling

## 10. Card & Layout Spacing Standards (CRITICAL)

**The Shadcn v2 `Card` component has built-in padding that you MUST account for.** Ignoring this causes double-padding bugs.

### How the Shadcn Card Works
| Slot | Default Classes | What It Does |
|------|----------------|--------------|
| `Card` | `py-6 gap-6` | Vertical padding on the outer card + gap between children |
| `CardHeader` | `px-6` | Horizontal padding, inherits card's `py-6` top space |
| `CardContent` | `px-6` | Horizontal padding only — **no vertical padding** |
| `CardFooter` | `px-6` | Horizontal padding only |

### Rules

1. **Use `CardHeader` + `CardContent` for structured cards.** The Card's `py-6 gap-6` gives you automatic spacing between header, content, and footer — don't add extra vertical padding.

2. **For compact cards (stat cards, metric tiles), reset Card padding:**
   ```tsx
   // ✅ Correct — reset Card padding, control it on CardContent
   <Card className="py-0">
     <CardContent className="pt-5 pb-5">...</CardContent>
   </Card>

   // ❌ Wrong — fighting Card's built-in py-6
   <Card>
     <CardContent className="p-5">...</CardContent>
   </Card>
   ```

3. **Never use bare `p-N` on CardContent.** CardContent already has `px-6`. Use `pt-N pb-N` if you need vertical control.

4. **Page-level spacing:** Always use `space-y-6` on the `<main>` container for consistent section gaps. Grid gaps should be `gap-4` (tight, for card grids) or `gap-6` (standard, for sections).

5. **Standard spacing scale:**
   | Context | Spacing |
   |---------|---------|
   | Page sections | `space-y-6` |
   | Card grids | `gap-4` |
    | Inside Card content | `space-y-3` or `space-y-4` |
    | Compact metrics | `py-2 px-3` |
    | Toolbar/filters | `gap-2` or `gap-3` |

## 11. Strict Types vs Constants Separation (CRITICAL)

**`types/` and `constants/` have completely different purposes. NEVER mix them.**

| Folder | Contains | Does NOT Contain |
|--------|----------|-----------------|
| `types/` | `interface`, `type`, `enum` declarations | `const`, `export const`, runtime values |
| `constants/` | `const` values (configs, defaults, options, pagination) | `interface`, `type` declarations |

### Rules

1. **`types/index.ts`** = interfaces and type aliases ONLY. Zero runtime values.
2. **`constants/index.ts`** = `const` values ONLY. Import needed types from `../types`.
3. **If a constant needs a type**, define the type in `types/`, then import it in `constants/`:
   ```typescript
   // types/index.ts
   export interface Country { code: string; name: string; }

   // constants/index.ts
   import type { Country } from '../types';
   export const COUNTRIES: Country[] = [
       { code: 'US', name: 'United States' },
   ];
   ```
4. **Components import types from `../types`** and constants from `../constants`** — never cross them.

### Red Flags (must be fixed)
- `interface` or `type` defined inside a `constants/` file
- `export const` defined inside a `types/` file
- Config objects (e.g. `ROLE_BADGE_CONFIG`, `STATUS_CONFIG`, `EMPTY_*`) living in `types/`
- Type definitions (e.g. `ThemeModeOption`, `RadiusOption`) living in `constants/`

## 12. Snake Case for Data Properties (CRITICAL)

**All data-model interface properties MUST use `snake_case`** to match the Laravel backend 1:1. This eliminates manual mapping between frontend and backend.

### What uses snake_case
| Layer | Example |
|-------|---------|
| Interface fields (data models) | `preview_text`, `from_name`, `recipient_count` |
| Mock data object keys | `{ from_name: '...', created_at: '...' }` |
| Component data access | `campaign.open_rate`, `profile.from_name` |
| Form data fields | `from_email`, `scheduled_at` |
| API response fields | `current_page`, `per_page`, `last_page` |

### What stays camelCase
| Layer | Example | Reason |
|-------|---------|--------|
| React props | `onClose`, `onChange`, `onClick` | React convention |
| Component prop interfaces | `onOpenCompose`, `forceLoading` | React convention |
| Function/variable names | `getEmailCampaigns()` | JS convention |
| Type/interface names | `EmailCampaign` | PascalCase, TS convention |
| Hook names | `useEmailQuery` | React convention |
| Boolean UI props | `forceLoading`, `forceEmpty`, `isEmpty` | React convention |

### Red Flags (must be fixed)
- `camelCase` property in a data-model interface (e.g. `createdAt` instead of `created_at`)
- Mock data using `camelCase` keys for API data
- Component accessing `campaign.openRate` instead of `campaign.open_rate`