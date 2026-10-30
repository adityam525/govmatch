'use client';

import { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Heading2, Heading3, Image as ImageIcon, Italic, Link as LinkIcon, List, ListOrdered, Minus, Quote, Redo2, Strikethrough, Undo2 } from 'lucide-react';
import '@/components/blog/blog-content.css';

const safeUrl = (value: string | null) => {
  if (!value) return null;
  try {
    const u = new URL(value.trim());
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.toString() : null;
  } catch {
    return null;
  }
};

function Btn({ label, active, onClick, children }: { label: string; active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`rounded-md p-2 text-neutral-600 hover:bg-neutral-100 ${active ? 'bg-primary-50 text-primary-700' : ''}`}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      // Underline comes with StarterKit in v2 through its own extension only when added, so it is left out; strike replaces it.
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' } }),
      Image,
      Placeholder.configure({ placeholder: 'Start writing your article...' }),
    ],
    content: value,
    editorProps: { attributes: { class: 'blog-content min-h-[22rem] px-4 py-3 outline-none' } },
    onUpdate: ({ editor: e }) => onChange(e.isEmpty ? '' : e.getHTML()),
  });

  // Loading a saved post sets the content once it arrives.
  useEffect(() => {
    if (editor && value !== editor.getHTML() && !editor.isFocused) editor.commands.setContent(value, { emitUpdate: false });
  }, [value, editor]);

  if (!editor) return <div className="h-72 rounded-xl border border-neutral-200 bg-neutral-50" />;

  const setLink = () => {
    const previous = editor.getAttributes('link').href as string | undefined;
    const input = window.prompt('Link address (leave empty to remove the link)', previous ?? 'https://');
    if (input === null) return;
    if (input.trim() === '') return void editor.chain().focus().extendMarkRange('link').unsetLink().run();
    const url = safeUrl(input);
    if (!url) return void window.alert('Enter a full web address starting with http:// or https://');
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = safeUrl(window.prompt('Image address (https://...)', 'https://'));
    if (!url) return void window.alert('Enter a full web address starting with http:// or https://');
    const alt = window.prompt('Describe the image for readers who cannot see it (helps SEO)', '') ?? '';
    editor.chain().focus().setImage({ src: url, alt }).run();
  };

  const chain = () => editor.chain().focus();
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-neutral-100 bg-neutral-50 px-2 py-1.5">
        <Btn label="Heading" active={editor.isActive('heading', { level: 2 })} onClick={() => chain().toggleHeading({ level: 2 }).run()}><Heading2 size={16} /></Btn>
        <Btn label="Sub-heading" active={editor.isActive('heading', { level: 3 })} onClick={() => chain().toggleHeading({ level: 3 }).run()}><Heading3 size={16} /></Btn>
        <span className="mx-1 h-5 w-px bg-neutral-200" />
        <Btn label="Bold" active={editor.isActive('bold')} onClick={() => chain().toggleBold().run()}><Bold size={16} /></Btn>
        <Btn label="Italic" active={editor.isActive('italic')} onClick={() => chain().toggleItalic().run()}><Italic size={16} /></Btn>
        <Btn label="Strikethrough" active={editor.isActive('strike')} onClick={() => chain().toggleStrike().run()}><Strikethrough size={16} /></Btn>
        <span className="mx-1 h-5 w-px bg-neutral-200" />
        <Btn label="Bullet list" active={editor.isActive('bulletList')} onClick={() => chain().toggleBulletList().run()}><List size={16} /></Btn>
        <Btn label="Numbered list" active={editor.isActive('orderedList')} onClick={() => chain().toggleOrderedList().run()}><ListOrdered size={16} /></Btn>
        <Btn label="Quote" active={editor.isActive('blockquote')} onClick={() => chain().toggleBlockquote().run()}><Quote size={16} /></Btn>
        <span className="mx-1 h-5 w-px bg-neutral-200" />
        <Btn label="Link" active={editor.isActive('link')} onClick={setLink}><LinkIcon size={16} /></Btn>
        <Btn label="Image" onClick={addImage}><ImageIcon size={16} /></Btn>
        <Btn label="Divider" onClick={() => chain().setHorizontalRule().run()}><Minus size={16} /></Btn>
        <span className="mx-1 h-5 w-px bg-neutral-200" />
        <Btn label="Undo" onClick={() => chain().undo().run()}><Undo2 size={16} /></Btn>
        <Btn label="Redo" onClick={() => chain().redo().run()}><Redo2 size={16} /></Btn>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
