import React, { useCallback, useState } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, X, File as FileIcon } from 'lucide-react';

interface DropzoneProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

export function Dropzone({ onFileSelect, isLoading }: DropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (isLoading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [isLoading, onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLoading) return;
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [isLoading, onFileSelect]);

  return (
    <div
      className={`relative rounded-2xl border-2 border-dashed p-10 transition-colors ${
        isDragOver ? 'border-indigo-500 bg-indigo-50' : 'border-zinc-300 bg-white hover:border-indigo-400'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept=".pdf, .docx, application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document, image/*"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleFileInput}
        disabled={isLoading}
        id="file-upload"
      />
      
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <div className="p-4 bg-indigo-50 text-indigo-600 rounded-full">
          <UploadCloud className="w-8 h-8" />
        </div>
        
        {selectedFile ? (
            <div className="flex items-center space-x-3 text-emerald-600 font-medium">
                <FileIcon className="w-5 h-5" />
                <span>{selectedFile.name} sélectionné</span>
            </div>
        ) : (
            <div>
            <h3 className="text-lg font-semibold text-zinc-900">
                Glissez-déposez votre document
            </h3>
            <p className="mt-2 text-sm text-zinc-500 max-w-sm mx-auto">
                Formats acceptés : PDF, DOCX ou image (PNG, JPG).
            </p>
            </div>
        )}
      </div>
    </div>
  );
}
