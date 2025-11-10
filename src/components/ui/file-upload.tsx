import { useState, useRef } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Upload, X, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FileUploadProps {
  onUpload: (url: string) => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  currentUrl?: string;
}

export function FileUpload({
  onUpload,
  accept = 'image/*',
  maxSize = 10,
  className,
  currentUrl,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }

      const data = await response.json();
      onUpload(data.imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleClear = () => {
    onUpload('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 transition-colors',
          dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
          uploading && 'opacity-50 pointer-events-none'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />

        <div className="flex flex-col items-center justify-center gap-2 text-center">
          {uploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div className="text-sm">
                <span className="font-semibold text-primary cursor-pointer hover:underline">
                  Click to upload
                </span>
                <span className="text-muted-foreground"> or drag and drop</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {accept === 'image/*' ? 'PNG, JPG, GIF, WebP, SVG' : accept} (max {maxSize}MB)
              </p>
            </>
          )}
        </div>
      </div>

      {currentUrl && (
        <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
          <div className="flex-1 text-sm truncate">{currentUrl}</div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
