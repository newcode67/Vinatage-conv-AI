import React, { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { motion } from 'motion/react';

interface FileUploaderProps {
  onDataLoaded: (data: any[], fileName: string) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onDataLoaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = async (file: File) => {
    setIsLoading(true);
    setError(null);

    const extension = file.name.split('.').pop()?.toLowerCase();

    try {
      if (extension === 'csv') {
        Papa.parse(file, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.data && results.data.length > 0) {
              onDataLoaded(results.data, file.name);
            } else {
              setError("The CSV file appears to be empty.");
            }
            setIsLoading(false);
          },
          error: (err) => {
            setError(`Error parsing CSV: ${err.message}`);
            setIsLoading(false);
          }
        });
      } else if (extension === 'xlsx' || extension === 'xls') {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const json = XLSX.utils.sheet_to_json(worksheet);
            
            if (json && json.length > 0) {
              onDataLoaded(json, file.name);
            } else {
              setError("The Excel file appears to be empty.");
            }
          } catch (err) {
            setError("Failed to parse Excel file.");
          }
          setIsLoading(false);
        };
        reader.readAsArrayBuffer(file);
      } else if (extension === 'txt') {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          // Try to parse as JSON first
          try {
            const json = JSON.parse(text);
            if (Array.isArray(json)) {
              onDataLoaded(json, file.name);
            } else {
              onDataLoaded([json], file.name);
            }
          } catch (err) {
            // Fallback to line-by-line parsing or tab-separated
            const lines = text.split('\n').filter(l => l.trim());
            if (lines.length > 0) {
              const data = lines.map(line => ({ content: line.trim() }));
              onDataLoaded(data, file.name);
            } else {
              setError("The text file appears to be empty.");
            }
          }
          setIsLoading(false);
        };
        reader.readAsText(file);
      } else {
        setError("Unsupported file format. Please upload CSV, Excel, or TXT.");
        setIsLoading(false);
      }
    } catch (err) {
      setError("An unexpected error occurred while processing the file.");
      setIsLoading(false);
    }
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`
          relative group cursor-pointer
          border-2 border-dashed rounded-[2.5rem] p-12
          transition-all duration-500 ease-out
          ${isDragging 
            ? 'border-orange-500 bg-orange-500/10 scale-[1.02]' 
            : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]'}
        `}
      >
        <input
          type="file"
          onChange={onFileChange}
          accept=".csv,.xlsx,.xls,.txt"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        
        <div className="flex flex-col items-center text-center gap-6">
          <div className={`
            w-20 h-20 rounded-3xl flex items-center justify-center
            transition-all duration-500
            ${isDragging ? 'bg-orange-500 text-white' : 'bg-white/5 text-white/40 group-hover:text-white group-hover:bg-white/10'}
          `}>
            {isLoading ? (
              <Loader2 className="w-10 h-10 animate-spin" />
            ) : (
              <Upload className="w-10 h-10" />
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white tracking-tight">
              {isLoading ? 'Processing Intelligence...' : 'Drop your data here'}
            </h3>
            <p className="text-white/40 text-sm font-medium">
              Supports CSV, Excel, and TXT files
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-rose-500 bg-rose-500/10 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default FileUploader;
