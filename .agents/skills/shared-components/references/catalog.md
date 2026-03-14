# Shared Components Catalog

## ExportDialog

**Path:** `@/components/shared/export-dialog`

**Import:**
```tsx
import { ExportDialog } from '@/components/shared/export-dialog';
import type { ExportFormat } from '@/components/shared/export-dialog';
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | — | Dialog open state |
| `onOpenChange` | `(open: boolean) => void` | — | Dialog state handler |
| `title` | `string` | `'Export'` | Dialog title |
| `description` | `string` | `'Choose a format...'` | Dialog subtitle |
| `onExport` | `(format: ExportFormat) => void` | — | Called with selected format |

**Formats:** `'csv' | 'pdf' | 'xlsx'`

> [!NOTE]
> The volunteers feature has its own `VolunteerExportDialog` with domain-specific filters (status, skills, date range, report type). It is **not** shared — it lives in `src/features/volunteers/components/dialogs.tsx`. Use the shared `ExportDialog` for generic format-only exports.

**Usage:**
```tsx
const [open, setOpen] = useState(false);
<ExportDialog
    open={open}
    onOpenChange={setOpen}
    title="Export Members"
    onExport={(format) => toast.success(`Exporting as ${format}`)}
/>
```

---

## openPrintPage

**Path:** `@/components/shared/print-page`

**Import:**
```tsx
import { openPrintPage } from '@/components/shared/print-page';
```

**Options:**
| Prop | Type | Description |
|------|------|-------------|
| `title` | `string` | Centered heading on the print page |
| `subtitle` | `string?` | Optional subtext below the title |

**Usage:**
```tsx
openPrintPage({
    title: 'Campaign Report',
    subtitle: 'Sent to 2,450 recipients',
});
```

---

## ShareDialog

**Path:** `@/components/shared/share-dialog`

**Import:**
```tsx
import { ShareDialog } from '@/components/shared/share-dialog';
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | — | Dialog open state |
| `onOpenChange` | `(open: boolean) => void` | — | Dialog state handler |
| `title` | `string` | `'Share'` | Dialog title |
| `description` | `string` | `'Share with your team...'` | Dialog subtitle |
| `onSendToGroup` | `(group, message) => void` | Toast fallback | Custom send handler |

**Groups:** `'admins' | 'board' | 'teachers' | 'volunteers' | 'parents' | 'all_staff'`

**Tabs:**
1. **Link** — Copy current page URL
2. **Send to Group** — Select group inbox + optional message

**Usage:**
```tsx
<ShareDialog
    open={open}
    onOpenChange={setOpen}
    title="Share Report"
    description="Share this report with your team"
/>
```

---

## HelpButton + HelpDialog

**Path:** `@/components/shared/help`

**Import:**
```tsx
import { HelpButton, type HelpContent } from '@/components/shared/help';
```

**Usage (page header):**
```tsx
const helpContent: HelpContent = {
    title: 'Page Help',
    description: 'Learn how to use this feature',
    videos: [{ id: '1', title: 'Tutorial', description: '...', thumbnail: '...', url: '...', duration: '4:00' }],
    faqs: [{ id: '1', question: 'How do I...?', answer: 'You can...' }],
};

usePageHeader({
    title: 'Page Title',
    actions: <HelpButton content={helpContent} variant="ghost" />,
});
```
