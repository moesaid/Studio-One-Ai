---
name: mjml-email-templates
description: Guide for creating MJML email templates that are fully compatible with the MailEngine drag-and-drop builder. Use when creating, editing, or reviewing email templates (.mjml files) that will be loaded into the builder via `fromMjml()`, rendered via `mjml-browser`, or registered in the template gallery. Covers the document tree structure, supported block types, attribute interfaces, and rendering pipeline.
---

# MJML Email Templates — Builder Compatibility Guide

## When to Use

Activate this skill whenever you:
- Create or edit `.mjml` template files
- Create a new built-in (Duha) email template
- Register a new template in `templates/`
- Debug round-trip issues between `toMjml()` ↔ `fromMjml()`
- Review MJML markup for builder compatibility
- Hydrate templates with `{{placeholder}}` variables

## Document Tree

The builder stores email state as a JSON tree:

```
EmailDocument
  └─ Section (mj-section)          ← top-level row
       └─ Column (mj-column)       ← vertical slice
            └─ Content block        ← text / image / button / divider / spacer /
                                       social / navbar / accordion / table / raw
```

### Container Blocks (have children)

| Block Type         | MJML Tag                | Valid Children                                     |
|--------------------|------------------------|----------------------------------------------------|
| `section`          | `<mj-section>`         | `column` only                                      |
| `column`           | `<mj-column>`          | Any content block                                  |
| `social`           | `<mj-social>`          | `social-element` only                              |
| `navbar`           | `<mj-navbar>`          | `navbar-link` only                                 |
| `accordion`        | `<mj-accordion>`       | `accordion-element` only                           |
| `accordion-element`| `<mj-accordion-element>` | `accordion-title` + `accordion-text`            |

### Content Blocks (leaf nodes)

| Block Type         | MJML Tag                 | Self-closing? | Has `content`? | Has `href`? |
|--------------------|--------------------------|:------------:|:--------------:|:-----------:|
| `text`             | `<mj-text>`              | No           | Yes (HTML)     | Yes         |
| `image`            | `<mj-image />`           | Yes          | No             | Yes         |
| `button`           | `<mj-button>`            | No           | Yes (label)    | Yes         |
| `divider`          | `<mj-divider />`         | Yes          | No             | No          |
| `spacer`           | `<mj-spacer />`          | Yes          | No             | No          |
| `social-element`   | `<mj-social-element />`  | Yes          | No             | Yes         |
| `navbar-link`      | `<mj-navbar-link>`       | No           | Yes (label)    | Yes         |
| `accordion-title`  | `<mj-accordion-title>`   | No           | Yes (text)     | No          |
| `accordion-text`   | `<mj-accordion-text>`    | No           | Yes (HTML)     | No          |
| `table`            | `<mj-table>`             | No           | Yes (HTML)     | No          |
| `raw`              | `<mj-raw>`               | No           | Yes (HTML)     | No          |
| `progress-bar`     | _(exported as mj-raw)_   | No           | No             | No          |

## Nesting Rules (strict)

1. **`EmailDocument.children`** → only `section` nodes
2. **`section.children`** → only `column` nodes (1–4 columns)
3. **`column.children`** → only content blocks (text, image, button, divider, spacer, progress-bar, social, navbar, accordion, table, raw)
4. **`social.children`** → only `social-element` nodes
5. **`navbar.children`** → only `navbar-link` nodes
6. **`accordion.children`** → only `accordion-element` nodes
7. **`accordion-element.children`** → exactly one `accordion-title` + one `accordion-text`

> Blocks that violate these rules will be silently dropped by `fromMjml()`.

## Link / href Support

- **Native href**: `button`, `image`, `social-element`, `navbar-link` have MJML-native `href` attribute
- **Text href**: `text` blocks with `href` get content wrapped in `<a href="..." target="_blank">` during serialization
- **No href**: `divider`, `spacer`, `accordion-*`, `table`, `raw` — MJML does not support clickable links on these

## Template Shell

Every template must follow this MJML structure:

```xml
<mjml>
  <mj-head>
    <mj-attributes>
      <mj-all font-family="Arial, sans-serif" font-size="14px" color="#333333" />
    </mj-attributes>
  </mj-head>
  <mj-body>
    <mj-section>
      <mj-column>
        <!-- content blocks here -->
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
```

Global attributes in `<mj-all>` are parsed into `EmailDocument.globalAttributes`.

## Column Width Rules

- Total column widths inside a section must sum to **100%** (or close)
- Widths must include the `%` suffix: `width="50%"`
- Missing widths default to even distribution

## Registering Built-in Templates

Built-in (Duha) templates live in `src/features/email-builder/templates/`. Each template is a `.ts` file exporting an `EmailTemplate` object with MJML markup.

### File Structure

```
src/features/email-builder/templates/
├── index.ts                    ← barrel (exports BUILT_IN_TEMPLATES array)
├── welcome.ts
├── newsletter.ts
├── event-invitation.ts
├── fundraising.ts
├── ramadan.ts
├── eid-greeting.ts
├── volunteer-appreciation.ts
└── community-update.ts
```

### Creating a New Template

1. Create a new file in `src/features/email-builder/templates/`:

```typescript
import type { EmailTemplate } from '@/features/email/types';

export const myTemplate: EmailTemplate = {
    id: 'duha-my-template',       // prefix with 'duha-'
    name: 'My Template',
    description: 'Short description',
    category: 'newsletter',       // must match EmailTemplateCategory
    thumbnail: '/templates/my-template.png',
    subject: 'Subject with {{masjid_name}}',
    preview_text: 'Preview text',
    body: '<h1>Fallback HTML</h1>',
    source: 'duha',
    mjml: `<mjml>...</mjml>`,      // ← use {{placeholders}} for branding
};
```

2. Add to `templates/index.ts`:

```typescript
import { myTemplate } from './my-template';

export const BUILT_IN_TEMPLATES: EmailTemplate[] = [
    // ... existing templates
    myTemplate,
];

export { myTemplate };
```

> **IMPORTANT:** The `BUILT_IN_TEMPLATES` array is consumed by `mock-data.ts` and flows through `getEmailTemplates()` → `useEmailTemplatesQuery()` → `TemplateGallery`. No additional registration is needed.

## Template Hydration

Built-in templates use `{{placeholder}}` tokens for dynamic branding data. These are replaced with real values before parsing via `fromMjml()`.

### Available Variables

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `{{masjid_name}}` | Organisation name | `Al-Noor Masjid` |
| `{{masjid_logo}}` | Logo image URL | `https://example.com/logo.png` |
| `{{masjid_address}}` | Street address | `123 Main St, Springfield, IL` |
| `{{masjid_phone}}` | Phone number | `(555) 123-4567` |
| `{{masjid_email}}` | Contact email | `info@alnoormasjid.org` |
| `{{masjid_website}}` | Website URL | `https://alnoormasjid.org` |
| `{{donation_url}}` | Donation page URL | `https://alnoormasjid.org/donate` |
| `{{board_chair}}` | Board chair name | `Ahmad Hassan` |
| `{{total_members}}` | Member count (string) | `2,450` |
| `{{total_donations}}` | Total donations (string) | `$125,000` |

### Usage Pattern

```typescript
import { hydrateTemplate, fromMjml } from '@/features/email-builder';
import type { TemplateVariables } from '@/features/email-builder';

// 1. Get variables from org data
const vars: TemplateVariables = {
    masjid_name: org.name,
    masjid_logo: org.logo_url,
    masjid_website: org.website,
};

// 2. Hydrate → Parse → Builder
const hydrated = hydrateTemplate(template.mjml!, vars);
const document = fromMjml(hydrated);
```

### Rules

1. **Always use `{{double_braces}}`** — single braces are not recognised
2. **Whitespace is tolerated**: `{{ masjid_name }}` works the same as `{{masjid_name}}`
3. **Missing variables are left as-is** — if no value is provided, the token stays in the output so the user can fill it in manually
4. **Never hardcode org-specific data** in built-in templates — always use placeholders
5. **Custom (DB) templates don't need hydration** — the user already filled in real values
6. **Add new variables** by extending the `TemplateVariables` interface in `template-hydration.ts`

## Icons & Visual Assets

### Rules

1. **Never use emoji characters** in template text — they render inconsistently across email clients
2. **Never use `<img>` tags inside `<mj-text>`** — always use `<mj-image>` as a separate element
3. **Always download icons locally** to `public/templates/icons/[template-name]/` and reference via `{{base_url}}`
4. **All image `src` attributes must use `{{base_url}}` prefix** — Never hardcode static paths like `/templates/icons/icon.png`. Always use `{{base_url}}/templates/icons/icon.png` so images resolve correctly in all environments (local dev, staging, production). The `{{base_url}}` token is hydrated from `NEXT_PUBLIC_APP_URL` at render time.

```xml
<!-- ✅ CORRECT — dynamic base_url -->
<mj-image src="{{base_url}}/templates/icons/newsletter/mosque.png"
          width="32px" alt="Mosque" />

<!-- ❌ WRONG — hardcoded static path -->
<mj-image src="/templates/icons/mosque.png"
          width="32px" alt="Mosque" />
```

### Icons8 Workflow

Use the Icons8 CDN to find and download fluency-style PNG icons:

```bash
# 1. Test if an icon name exists (HTTP 200 = valid)
curl -s -o /dev/null -w "%{http_code}" "https://img.icons8.com/fluency/96/{icon-name}.png"

# 2. Download to template icons directory
curl -s -o public/templates/icons/{template-name}/{icon-name}.png \
  "https://img.icons8.com/fluency/96/{icon-name}.png"

# 3. Verify it's a valid PNG
file public/templates/icons/{template-name}/{icon-name}.png
```

### Custom Generated Icons

For templates with a specific color palette, prefer **generating custom icons** via `generate_image` over using generic Icons8 fluency-style icons. This ensures icons match the template's visual identity. Store custom icons in `public/templates/icons/{template-name}/`.

### MJML Structure for Icons

```xml
<!-- ✅ CORRECT — mj-image as separate element with dynamic base_url -->
<mj-column>
  <mj-image src="{{base_url}}/templates/icons/{template-name}/icon.png"
            width="20px" alt="label" padding="0 0 4px" align="center" />
  <mj-text>Label text here</mj-text>
</mj-column>

<!-- ❌ WRONG — img inside mj-text -->
<mj-text><img src="..." /> Label text</mj-text>

<!-- ❌ WRONG — emoji in text -->
<mj-text>💡 Label text</mj-text>
```

### Known Icons8 Slug Gotchas

Some icon names don't match what you'd expect. Always `curl` test before using:

| Concept       | ❌ Wrong slug      | ✅ Correct slug |
|---------------|-------------------|----------------|
| Location pin  | `location-pin`    | `marker`       |
| Peanut        | `peanut`          | `peanuts`      |
| Heart         | `purple-heart`    | `like`         |
| Gold medal    | `gold-medal`      | `trophy`       |
| Silver medal  | `silver-medal`    | `medal`        |
| Bronze medal  | `bronze-medal`    | `prize`        |
| Medal variant | `medal-first`     | `medal--v1`    |

## Project Registration (MANDATORY)

After creating a new project directory under `src/projects/<name>/` with `project.json` and `templates.ts`, you **must** register it in `src/projects/registry.ts` or it will NOT appear on the dashboard.

Add these 4 lines following the existing pattern:

```typescript
// 1. Import metadata (alongside other project imports)
import myMeta from "./<name>/project.json";

// 2. Import templates (alongside other template imports)
import { templates as myTemplates } from "./<name>/templates";

// 3. Add to PROJECTS array
{ id: "<name>", ...myMeta } as ProjectMeta,

// 4. Add to ALL_TEMPLATES array
...buildTemplates("<name>", myTemplates),
```

> **Never skip this step.** Without it the project exists on disk but is invisible to the app.

## Common Pitfalls

1. **Wrong nesting**: Content blocks inside `<mj-section>` (without a column) → dropped
2. **Missing `%` on widths**: `width="50"` instead of `width="50%"` → parsing errors
3. **Unsupported tags**: `<mj-hero>`, `<mj-wrapper>`, or custom tags → silently dropped
4. **Self-closing content blocks**: `<mj-text />` won't have content; always use `<mj-text>...</mj-text>`
5. **`mj-social-element`** is self-closing — content is set via `name` attribute, not inner text
6. **`mj-table`** content is raw HTML `<tr>/<td>` markup, not `<table>` wrapper
7. **`mj-raw`** content is arbitrary HTML — no MJML attributes are supported
8. **Accordion children order**: `accordion-element` must contain exactly one `accordion-title` + one `accordion-text`
9. **Block-level HTML inside `<mj-text>`**: Never nest `<div>`, `<table>`, or other block-level HTML elements inside `<mj-text>`. Use `<mj-raw>` for custom HTML that cannot be expressed with MJML tags, or use a dedicated block type (like `progress-bar`). The builder's `fromMjml()` parser stores `<mj-text>` inner content as plain text/inline HTML — block-level elements will render as raw code instead of visual output.
10. **Missing section `background-color`**: Every `<mj-section>` must have an explicit `background-color` attribute. Without it, sections render as transparent in email clients, causing visual mismatches between the builder (which has a white canvas) and the actual email. Even full-bleed image sections should have `background-color="#FFFFFF"` set.
11. **Multiple links in one `<mj-text>` block**: Each link must be its own `<mj-button>` inside its own `<mj-column>`. Never group multiple links into a single block — the builder cannot select individual links. Use transparent-background `<mj-button>` instead of `<a>` inside `<mj-text>`:

```mjml
<!-- ✅ CORRECT — each link as its own mj-button -->
<mj-section>
  <mj-column width="33.33%">
    <mj-button background-color="transparent" color="#0f766e" font-size="14px"
               font-weight="600" inner-padding="0" href="https://facebook.com"
               align="center" text-decoration="none">
      Facebook
    </mj-button>
  </mj-column>
  <mj-column width="33.33%">
    <mj-button background-color="transparent" color="#0f766e" font-size="14px"
               font-weight="600" inner-padding="0" href="https://instagram.com"
               align="center" text-decoration="none">
      Instagram
    </mj-button>
  </mj-column>
</mj-section>

<!-- ❌ WRONG — <a> tags inside mj-text -->
<mj-text>
  <a href="https://facebook.com">Facebook</a> ·
  <a href="https://instagram.com">Instagram</a>
</mj-text>
```

12. **Inline HTML inside `<mj-text>`**: Never use `<span>`, `<strong>`, `<br/>`, `<a>`, `<div>`, or other HTML tags inside `<mj-text>` blocks. Every visual element must be expressed as a native MJML block:

| Need | ❌ Wrong | ✅ Correct |
|------|---------|-----------|
| Bold text | `<mj-text><strong>Bold</strong></mj-text>` | `<mj-text font-weight="700">Bold</mj-text>` |
| Line break | `<mj-text>Line 1<br/>Line 2</mj-text>` | Two separate `<mj-text>` blocks |
| Numbered list | `<span>` badge + `<strong>` title in one block | `<mj-column width="10%">` for number + `<mj-column width="90%">` for title/description |
| Link | `<mj-text><a href="#">Text</a></mj-text>` | `<mj-button background-color="transparent" href="#">Text</mj-button>` |

