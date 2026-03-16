'use client';

import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import { useEffect, useRef } from 'react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Quote,
  Highlighter,
  Undo,
  Redo,
  Minus,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

/* ─── Toolbar Button ──────────────────────────────────────────── */
function ToolbarButton({
  icon: Icon,
  label,
  isActive = false,
  onClick,
  disabled = false,
}: {
  icon: React.ElementType;
  label: string;
  isActive?: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`
          inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors
          ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
          ${isActive
            ? 'bg-primary/15 text-primary'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
          }
        `}
      >
        <Icon className="h-3.5 w-3.5" />
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

/* ─── Toolbar ─────────────────────────────────────────────────── */
function EditorToolbar({ editor }: { editor: Editor }) {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-0.5 flex-wrap px-3 py-1.5 border-b border-border/30 bg-muted/30">
        <ToolbarButton
          icon={Bold}
          label="Bold"
          isActive={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          icon={Italic}
          label="Italic"
          isActive={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          icon={UnderlineIcon}
          label="Underline"
          isActive={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        />
        <ToolbarButton
          icon={Strikethrough}
          label="Strikethrough"
          isActive={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        />
        <ToolbarButton
          icon={Highlighter}
          label="Highlight"
          isActive={editor.isActive('highlight')}
          onClick={() => editor.chain().focus().toggleHighlight().run()}
        />

        <Separator orientation="vertical" className="mx-1.5 h-5" />

        <ToolbarButton
          icon={Heading1}
          label="Heading 1"
          isActive={editor.isActive('heading', { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        />
        <ToolbarButton
          icon={Heading2}
          label="Heading 2"
          isActive={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        />
        <ToolbarButton
          icon={Heading3}
          label="Heading 3"
          isActive={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        />

        <Separator orientation="vertical" className="mx-1.5 h-5" />

        <ToolbarButton
          icon={List}
          label="Bullet List"
          isActive={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          icon={ListOrdered}
          label="Ordered List"
          isActive={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />

        <Separator orientation="vertical" className="mx-1.5 h-5" />

        <ToolbarButton
          icon={AlignLeft}
          label="Align Left"
          isActive={editor.isActive({ textAlign: 'left' })}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
        />
        <ToolbarButton
          icon={AlignCenter}
          label="Align Center"
          isActive={editor.isActive({ textAlign: 'center' })}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
        />
        <ToolbarButton
          icon={AlignRight}
          label="Align Right"
          isActive={editor.isActive({ textAlign: 'right' })}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
        />

        <Separator orientation="vertical" className="mx-1.5 h-5" />

        <ToolbarButton
          icon={Quote}
          label="Blockquote"
          isActive={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        />
        <ToolbarButton
          icon={Minus}
          label="Horizontal Rule"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        />

        <Separator orientation="vertical" className="mx-1.5 h-5" />

        <ToolbarButton
          icon={Undo}
          label="Undo"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        />
        <ToolbarButton
          icon={Redo}
          label="Redo"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        />
      </div>
    </TooltipProvider>
  );
}

/* ─── Premium Editor Styles ───────────────────────────────────── */
const editorStyles = `
  /* ── Base typography ── */
  .script-editor .ProseMirror {
    outline: none;
    min-height: 300px;
    padding: 2rem 2.5rem;
    font-family: 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 0.9375rem;
    line-height: 1.85;
    color: hsl(var(--foreground) / 0.85);
    max-width: 720px;
    margin: 0 auto;
  }

  /* ── Paragraphs ── */
  .script-editor .ProseMirror p {
    margin-bottom: 1rem;
  }

  .script-editor .ProseMirror > *:first-child {
    margin-top: 0;
  }

  /* ── Headings ── */
  .script-editor .ProseMirror h1 {
    font-size: 1.5rem;
    font-weight: 700;
    margin-top: 2.5rem;
    margin-bottom: 1rem;
    color: hsl(var(--foreground));
    letter-spacing: -0.025em;
    line-height: 1.3;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid hsl(var(--border) / 0.15);
  }

  .script-editor .ProseMirror h2 {
    font-size: 1.15rem;
    font-weight: 700;
    margin-top: 2rem;
    margin-bottom: 0.75rem;
    color: hsl(45 100% 60%);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    line-height: 1.4;
  }

  .script-editor .ProseMirror h3 {
    font-size: 1.05rem;
    font-weight: 600;
    margin-top: 1.5rem;
    margin-bottom: 0.5rem;
    color: hsl(var(--foreground) / 0.9);
    letter-spacing: -0.01em;
    line-height: 1.4;
  }

  /* ── Inline styles ── */
  .script-editor .ProseMirror strong {
    font-weight: 700;
    color: hsl(210 80% 65%);
    letter-spacing: 0.02em;
  }

  .script-editor .ProseMirror em {
    font-style: italic;
    color: hsl(var(--foreground) / 0.6);
  }

  .script-editor .ProseMirror u {
    text-decoration-color: hsl(var(--primary) / 0.5);
    text-underline-offset: 3px;
  }

  .script-editor .ProseMirror s {
    text-decoration-color: hsl(var(--foreground) / 0.3);
  }

  /* ── Blockquote ── */
  .script-editor .ProseMirror blockquote {
    border-left: 3px solid hsl(var(--primary) / 0.3);
    padding: 0.5rem 0 0.5rem 1.25rem;
    margin: 1.25rem 0;
    color: hsl(var(--foreground) / 0.65);
    font-style: italic;
    background: hsl(var(--primary) / 0.03);
    border-radius: 0 6px 6px 0;
  }

  .script-editor .ProseMirror blockquote p {
    margin-bottom: 0.5rem;
  }

  .script-editor .ProseMirror blockquote p:last-child {
    margin-bottom: 0;
  }

  /* ── Lists ── */
  .script-editor .ProseMirror ul,
  .script-editor .ProseMirror ol {
    padding-left: 1.5rem;
    margin-bottom: 1rem;
  }

  .script-editor .ProseMirror li {
    margin-bottom: 0.35rem;
  }

  .script-editor .ProseMirror li::marker {
    color: hsl(var(--foreground) / 0.35);
  }

  /* ── Highlight ── */
  .script-editor .ProseMirror mark {
    background-color: hsl(48 100% 50% / 0.25);
    border-radius: 2px;
    padding: 1px 3px;
  }

  /* ── Horizontal rule ── */
  .script-editor .ProseMirror hr {
    border: none;
    height: 1px;
    background: linear-gradient(90deg, transparent, hsl(var(--border) / 0.3), transparent);
    margin: 2rem 0;
  }

  /* ── Placeholder ── */
  .script-editor .ProseMirror p.is-editor-empty:first-child::before {
    content: attr(data-placeholder);
    float: left;
    color: hsl(var(--muted-foreground) / 0.35);
    pointer-events: none;
    height: 0;
    font-style: italic;
  }

  /* ── Read-only mode — extra breathing room ── */
  .script-editor-readonly .ProseMirror {
    padding: 2.5rem 3rem;
  }
`;

/* ─── Smart Screenplay → HTML Converter ───────────────────────── */

/**
 * Convert plain-text screenplay content to semantic HTML.
 * If the content already contains HTML tags, return as-is.
 * Detects: scene headings, character names, parentheticals, transitions, action lines.
 */
export function ensureHtml(content: string): string {
  if (!content || !content.trim()) return '';

  // Already HTML — return as-is
  if (/<[a-z][\s\S]*>/i.test(content)) return content;

  const lines = content.split('\n');
  const html: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Empty line → skip (spacing handled by margins)
    if (!trimmed) {
      i++;
      continue;
    }

    // Scene heading — INT. / EXT. / INT./EXT. / I/E.
    if (/^(INT\.|EXT\.|INT\.\/EXT\.|I\/E\.)/i.test(trimmed)) {
      html.push(`<h2>${escapeHtml(trimmed)}</h2>`);
      i++;
      continue;
    }

    // Transition — CUT TO:, FADE IN:, FADE OUT., DISSOLVE TO:, etc.
    if (/^(CUT TO:|FADE IN:|FADE OUT\.?|DISSOLVE TO:|SMASH CUT TO:|MATCH CUT TO:|FADE TO BLACK\.?|TITLE CARD:|THE END\.?)/i.test(trimmed)) {
      html.push(`<p><em>${escapeHtml(trimmed)}</em></p>`);
      i++;
      continue;
    }

    // Narration / V.O. — e.g. "NARRATION (V.O.)" or "CHARACTER (V.O.)"
    if (/^[A-Z][A-Z\s.']+\(V\.O\.\)$/i.test(trimmed) || /^NARRATION/i.test(trimmed)) {
      html.push(`<h3>${escapeHtml(trimmed)}</h3>`);
      i++;
      continue;
    }

    // Character name — ALL CAPS line, 2-40 chars, possibly with parenthetical like (CONT'D)
    if (/^[A-Z][A-Z\s\d.'()\-]+$/.test(trimmed) && trimmed.length >= 2 && trimmed.length <= 45) {
      html.push(`<p><strong>${escapeHtml(trimmed)}</strong></p>`);
      i++;

      // Check for parenthetical immediately after
      if (i < lines.length) {
        const next = lines[i].trim();
        if (/^\(.*\)$/.test(next)) {
          html.push(`<p><em>${escapeHtml(next)}</em></p>`);
          i++;
        }
      }

      // Collect dialogue lines (until next empty line or next character/heading)
      const dialogueLines: string[] = [];
      while (i < lines.length && lines[i].trim()) {
        const dl = lines[i].trim();
        // Stop if we hit another character name, scene heading, or transition
        if (/^[A-Z][A-Z\s\d.'()\-]+$/.test(dl) && dl.length >= 2 && dl.length <= 45) break;
        if (/^(INT\.|EXT\.|INT\.\/EXT\.|I\/E\.)/i.test(dl)) break;
        if (/^(CUT TO:|FADE IN:|FADE OUT|DISSOLVE TO:)/i.test(dl)) break;
        dialogueLines.push(dl);
        i++;
      }
      if (dialogueLines.length > 0) {
        html.push(`<blockquote><p>${dialogueLines.map(escapeHtml).join('<br/>')}</p></blockquote>`);
      }
      continue;
    }

    // Parenthetical on its own — (beat), (whispering), etc.
    if (/^\(.*\)$/.test(trimmed)) {
      html.push(`<p><em>${escapeHtml(trimmed)}</em></p>`);
      i++;
      continue;
    }

    // Action / description — collect consecutive non-empty lines into one paragraph
    const actionLines: string[] = [trimmed];
    i++;
    while (i < lines.length) {
      const next = lines[i].trim();
      if (!next) break;
      // Stop at structural elements
      if (/^(INT\.|EXT\.|INT\.\/EXT\.|I\/E\.)/i.test(next)) break;
      if (/^[A-Z][A-Z\s\d.'()\-]+$/.test(next) && next.length >= 2 && next.length <= 45) break;
      if (/^(CUT TO:|FADE IN:|FADE OUT|DISSOLVE TO:|NARRATION)/i.test(next)) break;
      if (/^\(.*\)$/.test(next)) break;
      actionLines.push(next);
      i++;
    }
    html.push(`<p>${actionLines.map(escapeHtml).join(' ')}</p>`);
  }

  return html.join('');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ─── Main ScriptEditor Component ─────────────────────────────── */
interface ScriptEditorProps {
  content: string;
  onChange?: (html: string) => void;
  editable?: boolean;
  placeholder?: string;
}

export function ScriptEditor({
  content,
  onChange,
  editable = true,
  placeholder = 'Start writing your screenplay...',
}: ScriptEditorProps) {
  const isInternalUpdate = useRef(false);
  const htmlContent = ensureHtml(content);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({ placeholder }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({ multicolor: false }),
      Typography,
    ],
    content: htmlContent,
    editable,
    onUpdate: ({ editor }) => {
      isInternalUpdate.current = true;
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none',
      },
    },
  });

  // Sync content from outside (switching chapters, AI results)
  useEffect(() => {
    if (!editor) return;
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    const newHtml = ensureHtml(content);
    editor.commands.setContent(newHtml, { emitUpdate: false });
  }, [content, editor]);

  // Sync editable state
  useEffect(() => {
    if (editor) {
      editor.setEditable(editable);
    }
  }, [editable, editor]);

  if (!editor) return null;

  return (
    <div className={`flex flex-col h-full ${editable ? 'script-editor' : 'script-editor script-editor-readonly'}`}>
      <style>{editorStyles}</style>
      {editable && <EditorToolbar editor={editor} />}
      <div className="flex-1 overflow-auto">
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  );
}

export { type Editor } from '@tiptap/react';
