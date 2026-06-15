import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

function ToolbarButton({ onClick, active, title, children }) {
    return (
        <button
            type="button"
            title={title}
            onClick={onClick}
            className={`btn btn-sm px-2 py-1 ${active ? 'btn-secondary' : 'btn-outline-secondary'}`}
            style={{ lineHeight: 1, fontSize: '13px' }}
        >
            {children}
        </button>
    );
}

export default function WysiwygEditor({ value, onChange, placeholder }) {
    const editor = useEditor({
        extensions: [StarterKit],
        content: value || '',
        onUpdate({ editor }) {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'wysiwyg-content',
                style: 'min-height:160px;padding:10px 12px;outline:none;',
            },
        },
    });

    if (!editor) return null;

    return (
        <div className="border rounded" style={{ background: '#fff' }}>
            <div className="d-flex flex-wrap gap-1 p-2 border-bottom bg-light">
                <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
                    <strong>B</strong>
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
                    <em>I</em>
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
                    <s>S</s>
                </ToolbarButton>
                <div className="border-start mx-1" />
                <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading">
                    H3
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} active={editor.isActive('heading', { level: 4 })} title="Subheading">
                    H4
                </ToolbarButton>
                <div className="border-start mx-1" />
                <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">
                    &#8226;&#8211;
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered list">
                    1.
                </ToolbarButton>
                <div className="border-start mx-1" />
                <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote">
                    &#8220;&#8221;
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline code">
                    {'</>'}
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code block">
                    &#9633;
                </ToolbarButton>
                <div className="border-start mx-1" />
                <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
                    &#8617;
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
                    &#8618;
                </ToolbarButton>
            </div>
            <EditorContent editor={editor} />
            {placeholder && !value && (
                <style>{`.wysiwyg-content p.is-editor-empty:first-child::before { content: "${placeholder}"; color: #adb5bd; pointer-events: none; float: left; height: 0; }`}</style>
            )}
        </div>
    );
}
