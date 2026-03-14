# Document Tree Reference

Complete attribute interfaces for every block type in the MailEngine builder.

## BlockType

```typescript
type BlockType =
    | "section" | "column"
    | "text" | "image" | "button" | "divider" | "spacer"
    | "social" | "social-element"
    | "navbar" | "navbar-link"
    | "accordion" | "accordion-element" | "accordion-title" | "accordion-text"
    | "table" | "raw";
```

## Structural Blocks

### SectionAttributes
| Attribute          | Type     | MJML Tag         |
|--------------------|----------|------------------|
| `padding`          | string   | `<mj-section>`   |
| `background-color` | string   | `<mj-section>`   |
| `background-url`   | string   | `<mj-section>`   |
| `full-width`       | `"full-width"` or `""` | `<mj-section>` |
| `border-radius`    | string   | `<mj-section>`   |
| `border-*`         | string   | `<mj-section>`   |

### ColumnAttributes
| Attribute          | Type     |
|--------------------|----------|
| `width`            | string   |
| `padding`          | string   |
| `background-color` | string   |
| `vertical-align`   | `"top"` / `"middle"` / `"bottom"` |
| `border-radius`    | string   |
| `border-*`         | string   |

## Content Blocks

### TextAttributes
| Attribute          | Type     |
|--------------------|----------|
| `font-size`        | string   |
| `font-family`      | string   |
| `font-weight`      | string   |
| `color`            | string   |
| `line-height`      | string   |
| `letter-spacing`   | string   |
| `align`            | `"left"` / `"center"` / `"right"` |
| `href`             | string (wraps content in `<a>` during serialization) |

### ImageAttributes
| Attribute          | Type     |
|--------------------|----------|
| `src`              | string (URL) |
| `alt`              | string   |
| `width`            | string   |
| `height`           | string   |
| `href`             | string   |
| `align`            | `"left"` / `"center"` / `"right"` |
| `border-radius`    | string   |

### ButtonAttributes
| Attribute          | Type     |
|--------------------|----------|
| `href`             | string   |
| `font-size`        | string   |
| `font-family`      | string   |
| `font-weight`      | string   |
| `color`            | string (text) |
| `background-color` | string   |
| `border-radius`    | string   |
| `inner-padding`    | string   |
| `align`            | `"left"` / `"center"` / `"right"` |

### DividerAttributes
| Attribute          | Type     |
|--------------------|----------|
| `border-color`     | string   |
| `border-style`     | `"solid"` / `"dashed"` / `"dotted"` |
| `border-width`     | string   |
| `padding`          | string   |

### SpacerAttributes
| Attribute          | Type     |
|--------------------|----------|
| `height`           | string   |

## Social Blocks

### SocialAttributes
| Attribute          | Type     |
|--------------------|----------|
| `align`            | `"left"` / `"center"` / `"right"` |
| `mode`             | `"horizontal"` / `"vertical"` |
| `icon-size`        | string   |
| `icon-padding`     | string   |
| `border-radius`    | string   |
| `font-family`      | string   |
| `font-size`        | string   |
| `color`            | string   |
| `padding`          | string   |

### SocialElementAttributes
| Attribute          | Type     |
|--------------------|----------|
| `name`             | string (`"facebook"`, `"twitter"`, `"instagram"`, etc.) |
| `href`             | string (link URL) |
| `src`              | string (custom icon URL) |
| `alt`              | string   |
| `icon-size`        | string   |
| `color`            | string   |
| `background-color` | string   |

## Navbar Blocks

### NavbarAttributes
| Attribute          | Type     |
|--------------------|----------|
| `align`            | `"left"` / `"center"` / `"right"` |
| `hamburger`        | `"hamburger"` |
| `padding`          | string   |

### NavbarLinkAttributes
| Attribute          | Type     |
|--------------------|----------|
| `href`             | string   |
| `color`            | string   |
| `font-family`      | string   |
| `font-size`        | string   |
| `font-weight`      | string   |
| `padding`          | string   |

## Accordion Blocks

### AccordionAttributes
| Attribute          | Type     |
|--------------------|----------|
| `padding`          | string   |
| `border`           | string   |
| `font-family`      | string   |
| `icon-align`       | `"left"` / `"right"` |

### AccordionElementAttributes
| Attribute          | Type     |
|--------------------|----------|
| `background-color` | string   |
| `font-family`      | string   |

### AccordionTitleAttributes
| Attribute          | Type     |
|--------------------|----------|
| `color`            | string   |
| `font-size`        | string   |
| `font-weight`      | string   |
| `padding`          | string   |
| `background-color` | string   |

### AccordionTextAttributes
| Attribute          | Type     |
|--------------------|----------|
| `color`            | string   |
| `font-size`        | string   |
| `font-weight`      | string   |
| `padding`          | string   |
| `background-color` | string   |
| `line-height`      | string   |

## Table & Raw Blocks

### TableAttributes
| Attribute          | Type     |
|--------------------|----------|
| `align`            | `"left"` / `"center"` / `"right"` |
| `color`            | string   |
| `font-family`      | string   |
| `font-size`        | string   |
| `line-height`      | string   |
| `width`            | string   |
| `padding`          | string   |

Content is raw `<tr>/<td>` HTML markup (no `<table>` wrapper).

### RawAttributes
| Attribute          | Type     |
|--------------------|----------|
| `position`         | `"file-start"` (optional) |

Content is arbitrary HTML.

---

## Serialization Pipeline

| Step | Function | File | Description |
|------|----------|------|-------------|
| 1 | `toMjml(doc)` | `to-mjml.ts` | JSON tree → MJML string |
| 2 | `renderToHtml(mjml)` | `render-service.ts` | MJML string → HTML (via `mjml-browser`) |
| 3 | `fromMjml(str)` | `from-mjml.ts` | MJML string → JSON tree |

### Round-trip Notes

- `toMjml()` wraps text content in `<a>` when `href` is set
- `fromMjml()` uses `CONTENT_TYPES` set to differentiate blocks that store inner content vs children
- `mj-social-element` is recognized as self-closing
