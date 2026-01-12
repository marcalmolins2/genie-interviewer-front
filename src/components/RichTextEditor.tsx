import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
// @ts-ignore - no types available for this package
import MarkdownShortcuts from 'quill-markdown-shortcuts';

// Register the markdown shortcuts module
Quill.register('modules/markdownShortcuts', MarkdownShortcuts);

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
  ],
  markdownShortcuts: {}
};

const formats = [
  'header',
  'bold', 'italic',
  'list', 'bullet'
];

export const RichTextEditor = ({ value, onChange, placeholder, minHeight = '150px' }: RichTextEditorProps) => {
  return (
    <div 
      className="rich-text-editor [&_.ql-editor]:text-sm"
      style={{ ['--editor-min-height' as string]: minHeight }}
    >
      <ReactQuill
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
