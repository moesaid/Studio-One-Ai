---
name: shared-components
description: Catalog of all reusable shared/global UI components in `src/components/shared/`. Use when building new features, adding export/print/share/help functionality, or deciding whether to create a feature-specific component vs reusing an existing shared one. Triggers on requests involving modals, dialogs, export, print, share, help buttons, or any cross-feature UI pattern.
---

# Shared Components

## Decision: Shared vs Feature-Specific

Use a **shared** component when:
- 2+ features need the same UI pattern (export, share, print, help)
- The component has no feature-specific business logic
- Props are generic enough to work across domains

Use a **feature-specific** component when:
- It contains domain logic (e.g., email campaign stats)
- Only one feature will ever need it
- It tightly couples to feature types/hooks

## Available Components

See [references/catalog.md](references/catalog.md) for full catalog with props and usage examples.

### Quick Reference

| Component | Path | Use Case |
|-----------|------|----------|
| `ExportDialog` | `@/components/shared/export-dialog` | Export data in CSV/PDF/Excel format |
| `openPrintPage` | `@/components/shared/print-page` | Print placeholder page (white bg, centered text) |
| `ShareDialog` | `@/components/shared/share-dialog` | Share via link copy or group inbox |
| `HelpButton` | `@/components/shared/help` | Page-level help with videos + FAQs |

## Creating New Shared Components

Follow this structure:

```
src/components/shared/[component-name]/
├── ComponentName.tsx    # PascalCase component file
├── types.ts             # Props and type definitions
└── index.ts             # Barrel exports
```

Rules:
1. Types in `types.ts`, never inline in the component
2. Barrel export everything from `index.ts`
3. Follow existing naming: `ExportDialog.tsx`, `ShareDialog.tsx`, `HelpButton.tsx`
4. Use Shadcn primitives — compose, don't reinvent
5. After creating, update `references/catalog.md` in this skill
