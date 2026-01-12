import { useRef, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
// @ts-ignore - no types available for this package
import QuillMarkdown from 'quilljs-markdown';
import 'quilljs-markdown/dist/quilljs-markdown-common-style.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['clean']
  ]
};

const formats = [
  'header',
  'bold', 'italic',
  'list', 'bullet'
];

export const RichTextEditor = ({ value, onChange, placeholder, minHeight = '150px' }: RichTextEditorProps) => {
  const quillRef = useRef<ReactQuill>(null);
  const markdownRef = useRef<any>(null);

  useEffect(() => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      
      if (markdownRef.current) {
        markdownRef.current.destroy();
      }
      
      markdownRef.current = new QuillMarkdown(editor, {
        ignoreTags: ['strikethrough'],
      });
    }
    
    return () => {
      if (markdownRef.current) {
        markdownRef.current.destroy();
      }
    };
  }, []);

  return (
    <div 
      className="rich-text-editor [&_.ql-editor]:text-sm"
      style={{ ['--editor-min-height' as string]: minHeight }}
    >
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="bg-background [&_.ql-container]:min-h-[var(--editor-min-height)]"
      />
    </div>
  );
};
