---
description: How to prep a feature for production deployment
---

# Production Prep Workflow

Use this workflow before deploying any feature to production. This ensures consistent code structure across all features.

## 1. Verify Feature Directory Structure

Ensure the feature has this exact structure:
```
src/features/[feature-name]/
├── components/
│   ├── [component-files].tsx
│   └── index.ts
├── hooks/
│   ├── use-[feature]-query.ts   ← TanStack Query hooks
│   ├── use-[feature].ts         ← UI state hooks
│   └── index.ts
├── services/
│   ├── [feature]-api.ts         ← API service with mock fallback
│   ├── mock-data.ts             ← Mock data
│   └── index.ts
├── types/
│   └── index.ts                 ← interfaces & type aliases ONLY
└── constants/
    └── index.ts                 ← const values ONLY
```

## 2. Validate Services Layer

// turbo
Check that `[feature]-api.ts` follows the correct pattern:

```bash
grep -l "USE_MOCK_DATA" src/features/[feature-name]/services/[feature]-api.ts
```

Required elements:
- [ ] Uses `const USE_MOCK_DATA = process.env.NEXT_PUBLIC_IS_PRODUCTION !== 'true';`
- [ ] Has `withMockFallback` helper function
- [ ] Uses `apiClient` from `@/lib/api-client`
- [ ] All responses wrapped in `{ data: ... }` format

## 3. Validate Query Hooks

Check that `use-[feature]-query.ts` follows the correct pattern:

Required elements:
- [ ] Imports from `@tanstack/react-query`
- [ ] Uses `toast` from `sonner` for notifications
- [ ] Defines `queryKeys` object for cache management
- [ ] All mutations have `onSuccess` and `onError` handlers
- [ ] NO mock data logic (that stays in services)

## 4. Validate UI State Hooks

Check that `use-[feature].ts` follows the correct pattern:

Required elements:
- [ ] Uses React hooks (`useState`, `useCallback`, `useMemo`)
- [ ] Manages modal states
- [ ] Manages form data
- [ ] Contains formatting utilities if needed
- [ ] NO API calls (that stays in query hooks)

## 5. Verify Environment Variable Usage

// turbo
Ensure no direct `NODE_ENV` usage:

```bash
grep -r "NODE_ENV" src/features/[feature-name]/ --include="*.ts" --include="*.tsx"
```

Should return NO results. All environment checks must use:
```typescript
process.env.NEXT_PUBLIC_IS_PRODUCTION !== 'true'
```

## 6. Check Index Exports

// turbo
Verify all index.ts files export correctly:

```bash
cat src/features/[feature-name]/hooks/index.ts
cat src/features/[feature-name]/services/index.ts
```

## 7. Build Verification

// turbo
Run the build to catch any TypeScript errors:

```bash
npm run build
```

## 8. Check for Inline Content in Pages (CRITICAL)

Review the main page file (`src/app/.../page.tsx`) for violations:

// turbo
```bash
grep -n "\.map\((.*) =>" src/app/\(dashboard\)/dashboard/[feature-name]/page.tsx | head -20
```

If arrays are being mapped **inside JSX**:
- [ ] Arrays with data (FAQ, lists, config) should be in `mock-data.ts`
- [ ] Components rendering that data should be in `components/`
- [ ] Data should flow through query hooks, not be hardcoded

**Red Flags (must be refactored):**
- Hardcoded arrays with content (text, URLs, configurations)
- Inline `<details>`, `<summary>` blocks with mapped data
- External image URLs defined in page component
- Any data that could come from an API but is inline

## 9. Check for Inline Interfaces in Components (CRITICAL)

// turbo
```bash
grep -n "^interface " src/features/[feature-name]/components/*.tsx
```

**Every interface** used in feature components must be defined in `src/features/[feature-name]/types/index.ts`, not inline in component files.

**All of the following must be in the types layer:**
- Props interfaces (e.g. `FeatureComponentProps`)
- Data model interfaces (e.g. `CandidateEntry`, `OptionEntry`)
- Any `interface` or `type` declarations used across the feature

**Red Flags (must be moved):**
- `interface FooProps { ... }` defined at the top of a component file
- `interface BarModel { ... }` defined inline in any component
- Type definitions in `mock-data.ts` that should be in the types layer

## 9.5. Check Types vs Constants Separation (CRITICAL)

// turbo
```bash
grep -n "^interface \|^export interface \|^type \|^export type " src/features/[feature-name]/constants/*.ts
```

// turbo
```bash
grep -n "^export const \|^const " src/features/[feature-name]/types/*.ts
```

**Both commands should return NO results.** If they do:
- **Interfaces/types in `constants/`** → move them to `types/index.ts`
- **Constants in `types/`** → move them to `constants/index.ts`
- Update all import paths in components accordingly

**The rule is absolute:**
- `types/` = interfaces, type aliases, enums ONLY (zero runtime values)
- `constants/` = `const` values ONLY (import types from `../types`)

## 10. Check Help Content Placement

Help content (videos, FAQs) must follow the service → query hook → component pattern:

- [ ] Mock help content defined in `mock-data.ts`
- [ ] API service function in `[feature]-api.ts` using `withMockFallback`
- [ ] Query hook in `use-[feature]-query.ts`
- [ ] Page imports and uses the query hook, NOT inline `HelpContent` constants

Make sure all inner components has no hardcoded values or data or interfaces used inline, and the data layer ,services layer , hooks layer , types layer are all used correctly and nothing violates separation of concerns and ready for peoduction flipp for the use of api

## 11. Final Checklist

Before marking as production-ready:

- [ ] All services use `withMockFallback` pattern
- [ ] Query hooks have toast notifications
- [ ] UI hooks manage all local state
- [ ] No `NODE_ENV` direct usage
- [ ] Build passes with no errors
- [ ] All index.ts files export correctly
- [ ] **No inline/hardcoded data in page files**
- [ ] **All content-rendering is in feature components**
- [ ] **No inline interfaces in component files — all in types layer**
- [ ] **Help content flows through service → query hook → component**
- [ ] **No `interface`/`type` in constants files — types only in `types/`**
- [ ] **No `const` values in types files — constants only in `constants/`**