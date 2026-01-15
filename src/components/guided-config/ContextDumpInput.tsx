import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Mic, MicOff, X, FileText, File } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadedDocument {
  file: File;
  type: 'guide' | 'brief' | 'background';
}

interface ContextDumpInputProps {
  value: string;
  onChange: (value: string) => void;
  uploadedDocuments: File[];
  onDocumentsChange: (files: File[]) => void;
}

const SMART_PLACEHOLDER = `Tell us about your interview...

• What do you want to learn? (your main research question)
• Who will you interview? (role, industry, experience)
• Key topics to explore
• How long should each interview be?

You can also upload research briefs, interview guides, or background documents.`;

const ACCEPTED_FILE_TYPES = '.pdf,.doc,.docx,.ppt,.pptx,.txt,.md';

export function ContextDumpInput({
  value,
  onChange,
  uploadedDocuments,
  onDocumentsChange,
}: ContextDumpInputProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [recognition, setRecognition] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle file selection
  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;
    
    const validExtensions = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt', '.md'];
    const newFiles = Array.from(files).filter(file =>
      validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
    );
    
    if (newFiles.length > 0) {
      onDocumentsChange([...uploadedDocuments, ...newFiles]);
    }
  }, [uploadedDocuments, onDocumentsChange]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  // Remove uploaded file
  const removeFile = useCallback((index: number) => {
    const newFiles = [...uploadedDocuments];
    newFiles.splice(index, 1);
    onDocumentsChange(newFiles);
  }, [uploadedDocuments, onDocumentsChange]);

  // Voice input handlers
  const startVoiceInput = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    if (!win.webkitSpeechRecognition && !win.SpeechRecognition) {
      alert('Voice input is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognitionClass();
    
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = 'en-US';

    let finalTranscript = value;

    recognitionInstance.onresult = (event) => {
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += (finalTranscript ? ' ' : '') + transcript;
          onChange(finalTranscript);
        } else {
          interimTranscript += transcript;
        }
      }
    };

    recognitionInstance.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      setRecognition(null);
    };

    recognitionInstance.onend = () => {
      setIsRecording(false);
      setRecognition(null);
    };

    recognitionInstance.start();
    setRecognition(recognitionInstance);
    setIsRecording(true);
  }, [value, onChange]);

  const stopVoiceInput = useCallback(() => {
    if (recognition) {
      recognition.stop();
      setRecognition(null);
      setIsRecording(false);
    }
  }, [recognition]);

  const toggleVoiceInput = useCallback(() => {
    if (isRecording) {
      stopVoiceInput();
    } else {
      startVoiceInput();
    }
  }, [isRecording, startVoiceInput, stopVoiceInput]);

  // Get file icon based on extension
  const getFileIcon = (fileName: string) => {
    const ext = fileName.toLowerCase().split('.').pop();
    if (['pdf', 'doc', 'docx'].includes(ext || '')) {
      return <FileText className="h-4 w-4 text-blue-500" />;
    }
    return <File className="h-4 w-4 text-muted-foreground" />;
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* Main textarea */}
      <div
        className={cn(
          'relative rounded-lg border-2 border-dashed transition-colors',
          isDragOver 
            ? 'border-primary bg-primary/5' 
            : 'border-transparent'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={SMART_PLACEHOLDER}
          className={cn(
            'min-h-[320px] p-4 text-base resize-none transition-all',
            'focus-visible:ring-2 focus-visible:ring-ring',
            isDragOver && 'opacity-50'
          )}
        />
        
        {/* Drag overlay */}
        {isDragOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary/10 rounded-lg pointer-events-none">
            <div className="flex flex-col items-center gap-2 text-primary">
              <Upload className="h-8 w-8" />
              <span className="font-medium">Drop files here</span>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        {/* Upload button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          Upload Documents
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPTED_FILE_TYPES}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        {/* Voice input button */}
        <Button
          type="button"
          variant={isRecording ? 'default' : 'outline'}
          size="sm"
          onClick={toggleVoiceInput}
          className={cn(
            'gap-2 transition-all',
            isRecording && 'bg-red-500 hover:bg-red-600 text-white'
          )}
        >
          {isRecording ? (
            <>
              <MicOff className="h-4 w-4" />
              Stop Recording
            </>
          ) : (
            <>
              <Mic className="h-4 w-4" />
              Voice Input
            </>
          )}
        </Button>

        {isRecording && (
          <span className="text-sm text-muted-foreground animate-pulse">
            Listening...
          </span>
        )}
      </div>

      {/* Uploaded files list */}
      {uploadedDocuments.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Uploaded Documents ({uploadedDocuments.length})
          </label>
          <div className="flex flex-wrap gap-2">
            {uploadedDocuments.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border text-sm group"
              >
                {getFileIcon(file.name)}
                <span className="max-w-[200px] truncate">{file.name}</span>
                <span className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="ml-1 p-0.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Helper text */}
      <p className="text-xs text-muted-foreground">
        Supported formats: PDF, Word, PowerPoint, Text, Markdown
      </p>
    </div>
  );
}
