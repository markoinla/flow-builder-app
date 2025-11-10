import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import TextAlign from '@tiptap/extension-text-align';
import Mention from '@tiptap/extension-mention';
import { PluginKey } from '@tiptap/pm/state';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Heading2,
  Code,
  Quote,
  ListTodo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Tag
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

// Predefined badge options
const BADGE_OPTIONS = [
  { id: 'todo', label: 'TODO', color: 'blue' },
  { id: 'in-progress', label: 'In Progress', color: 'yellow' },
  { id: 'done', label: 'Done', color: 'green' },
  { id: 'urgent', label: 'Urgent', color: 'red' },
  { id: 'important', label: 'Important', color: 'orange' },
  { id: 'note', label: 'Note', color: 'purple' },
];

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const [showBadgeMenu, setShowBadgeMenu] = useState(false);
  const [badgeMenuPosition, setBadgeMenuPosition] = useState({ top: 0, left: 0 });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Enter content...',
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'flex items-start gap-2',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Mention.configure({
        HTMLAttributes: {
          class: 'badge',
        },
        suggestion: {
          items: ({ query }) => {
            return BADGE_OPTIONS.filter(item =>
              item.label.toLowerCase().includes(query.toLowerCase())
            );
          },
          render: () => {
            let component: any;
            let popup: any;

            return {
              onStart: (props) => {
                component = {
                  items: props.items,
                  command: props.command,
                };
              },
              onUpdate(props) {
                component = {
                  items: props.items,
                  command: props.command,
                };
              },
              onKeyDown(props) {
                if (props.event.key === 'Escape') {
                  return true;
                }
                return false;
              },
              onExit() {
                component = null;
              },
            };
          },
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] px-3 py-2',
      },
    },
  });

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const insertBadge = () => {
    const badge = window.prompt('Enter badge text (or choose: TODO, Done, Urgent, Important, Note):');
    if (badge) {
      editor?.chain().focus().insertContent(`<span class="badge" data-type="mention" data-id="${badge}">${badge}</span>`).run();
    }
  };

  return (
    <div className="border rounded-md">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b bg-muted/30">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded hover:bg-accent ${
            editor.isActive('bold') ? 'bg-accent' : ''
          }`}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded hover:bg-accent ${
            editor.isActive('italic') ? 'bg-accent' : ''
          }`}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-1.5 rounded hover:bg-accent ${
            editor.isActive('code') ? 'bg-accent' : ''
          }`}
          title="Inline Code"
        >
          <Code className="h-4 w-4" />
        </button>

        <div className="w-px h-6 bg-border mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded hover:bg-accent ${
            editor.isActive('heading', { level: 2 }) ? 'bg-accent' : ''
          }`}
          title="Heading"
        >
          <Heading2 className="h-4 w-4" />
        </button>

        <div className="w-px h-6 bg-border mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-1.5 rounded hover:bg-accent ${
            editor.isActive({ textAlign: 'left' }) ? 'bg-accent' : ''
          }`}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-1.5 rounded hover:bg-accent ${
            editor.isActive({ textAlign: 'center' }) ? 'bg-accent' : ''
          }`}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-1.5 rounded hover:bg-accent ${
            editor.isActive({ textAlign: 'right' }) ? 'bg-accent' : ''
          }`}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </button>

        <div className="w-px h-6 bg-border mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded hover:bg-accent ${
            editor.isActive('bulletList') ? 'bg-accent' : ''
          }`}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded hover:bg-accent ${
            editor.isActive('orderedList') ? 'bg-accent' : ''
          }`}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={`p-1.5 rounded hover:bg-accent ${
            editor.isActive('taskList') ? 'bg-accent' : ''
          }`}
          title="Task List"
        >
          <ListTodo className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded hover:bg-accent ${
            editor.isActive('blockquote') ? 'bg-accent' : ''
          }`}
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </button>

        <div className="w-px h-6 bg-border mx-1" />

        <button
          type="button"
          onClick={setLink}
          className={`p-1.5 rounded hover:bg-accent ${
            editor.isActive('link') ? 'bg-accent' : ''
          }`}
          title="Add Link"
        >
          <LinkIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={insertBadge}
          className="p-1.5 rounded hover:bg-accent"
          title="Insert Badge"
        >
          <Tag className="h-4 w-4" />
        </button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}
