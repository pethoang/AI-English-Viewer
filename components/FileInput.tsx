import React, { useRef } from 'react';

interface FileInputProps {
  id: string;
  label: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  acceptedFileTypes?: string;
}

const FileInput: React.FC<FileInputProps> = ({ id, label, file, onFileChange, acceptedFileTypes }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    onFileChange(selectedFile || null);
    // Reset the input value to allow re-selecting the same file
    if (inputRef.current) {
        inputRef.current.value = '';
    }
  };

  const handleRemoveFile = () => {
    onFileChange(null);
  };

  return (
    <div>
      <label className="block text-lg font-semibold text-slate-700 mb-2">
        {label}
      </label>
      <div className="mt-2">
        {!file ? (
           <label
            htmlFor={id}
            className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-8 h-8 mb-4 text-slate-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
              </svg>
              <p className="mb-2 text-sm text-slate-500"><span className="font-semibold">Nhấn để tải lên</span> hoặc kéo thả</p>
              <p className="text-xs text-slate-500">DOCX, PDF</p>
            </div>
            <input ref={inputRef} id={id} type="file" className="absolute w-full h-full opacity-0" accept={acceptedFileTypes} onChange={handleFileSelect} />
          </label>
        ) : (
          <div className="w-full p-3 border border-slate-300 rounded-lg bg-white flex justify-between items-center">
             <div className="flex items-center space-x-3 overflow-hidden">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm text-slate-800 font-medium truncate" title={file.name}>{file.name}</span>
             </div>
            <button onClick={handleRemoveFile} className="text-slate-500 hover:text-red-600 font-bold p-1 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileInput;
