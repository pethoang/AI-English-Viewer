import React, { useState } from 'react';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

import Header from './components/Header';
import FileInput from './components/FileInput';
import GradeSelector from './components/GradeSelector';
import ReportDisplay from './components/ReportDisplay';
import { reviewTest } from './services/geminiService';

// Set up the PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs`;

function App() {
  const [testFile, setTestFile] = useState<File | null>(null);
  const [answerKeyFile, setAnswerKeyFile] = useState<File | null>(null);
  
  const [testContent, setTestContent] = useState('');
  const [answerKeyContent, setAnswerKeyContent] = useState('');
  
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  
  const [report, setReport] = useState<string>('');
  const [isParsing, setIsParsing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseFileContent = async (file: File): Promise<string> => {
    if (file.name.endsWith('.docx')) {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } else if (file.name.endsWith('.pdf')) {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => ('str' in item ? item.str : '')).join(' ');
        fullText += pageText + '\n';
      }
      return fullText;
    }
    throw new Error('Unsupported file type. Please use .docx or .pdf');
  };

  const handleFileChange = async (file: File | null, type: 'test' | 'answerKey') => {
    // Set file state immediately for UI feedback
    if (type === 'test') {
      setTestFile(file);
      if (!file) setTestContent('');
    } else {
      setAnswerKeyFile(file);
      if (!file) setAnswerKeyContent('');
    }

    if (!file) return;

    setIsParsing(true);
    setError(null);
    
    try {
      const content = await parseFileContent(file);
      if (type === 'test') {
        setTestContent(content);
      } else {
        setAnswerKeyContent(content);
      }
    } catch (err: any) {
      setError(`Error parsing ${file.name}: ${err.message}`);
      // Clear the invalid file
      if (type === 'test') {
        setTestFile(null);
        setTestContent('');
      } else {
        setAnswerKeyFile(null);
        setAnswerKeyContent('');
      }
    } finally {
      setIsParsing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!testContent.trim()) {
      setError('Vui lòng tải lên tệp đề thi.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setReport('');

    try {
      const result = await reviewTest(testContent, answerKeyContent, selectedGrade);
      setReport(result);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setTestFile(null);
    setAnswerKeyFile(null);
    setTestContent('');
    setAnswerKeyContent('');
    setSelectedGrade(null);
    setReport('');
    setError(null);
    setIsLoading(false);
    setIsParsing(false);
  };
  
  const isButtonDisabled = isLoading || isParsing;
  
  return (
    <div className="bg-slate-50 min-h-screen font-sans flex flex-col">
      <Header />
      <main className="container mx-auto p-4 md:p-8 flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Input Column */}
          <div className="md:col-span-4">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 sticky top-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <h2 className="text-xl font-bold text-slate-800">Nhập dữ liệu</h2>
                <FileInput
                  id="test-file-upload"
                  label="Nội dung đề thi"
                  file={testFile}
                  onFileChange={(file) => handleFileChange(file, 'test')}
                  acceptedFileTypes=".docx,.pdf"
                />
                <FileInput
                  id="answer-key-upload"
                  label="Đáp án (tùy chọn)"
                  file={answerKeyFile}
                  onFileChange={(file) => handleFileChange(file, 'answerKey')}
                  acceptedFileTypes=".docx,.pdf"
                />
                <GradeSelector
                  selectedGrade={selectedGrade}
                  onGradeChange={setSelectedGrade}
                />
                 {error && (
                  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 text-sm" role="alert">
                    <p className="font-bold">Lỗi</p>
                    <p>{error}</p>
                  </div>
                 )}
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:bg-slate-400 disabled:cursor-not-allowed text-lg"
                  disabled={isButtonDisabled}
                >
                  {isLoading ? 'Đang phân tích...' : isParsing ? 'Đang xử lý tệp...' : 'Duyệt đề thi'}
                </button>
              </form>
            </div>
          </div>

          {/* Output Column */}
          <div className="md:col-span-8">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-slate-200 min-h-[600px]">
              {isLoading && (
                <div className="text-center py-16 flex flex-col items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-slate-600 font-semibold">AI đang phân tích đề thi, vui lòng chờ trong giây lát...</p>
                </div>
              )}
              
              {!isLoading && report && (
                <div className="space-y-6">
                  <ReportDisplay content={report} />
                  <button
                    onClick={handleReset}
                    className="w-full mt-6 bg-slate-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all duration-200 text-lg"
                  >
                    Duyệt đề thi khác
                  </button>
                </div>
              )}

              {!isLoading && !report && (
                <div className="text-center py-16 flex flex-col items-center justify-center h-full text-slate-500">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                   </svg>
                  <h3 className="text-lg font-semibold">Báo cáo sẽ được hiển thị ở đây</h3>
                  <p className="max-w-md mt-1">Vui lòng tải lên tệp đề thi và đáp án (nếu có) ở bảng bên trái và nhấn "Duyệt đề thi" để bắt đầu.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <footer className="text-center py-4 bg-slate-100 border-t border-slate-200">
        <p className="text-sm text-slate-600">
            Designed by Ông Giáo - Zalo: 0913.885.221
        </p>
      </footer>
    </div>
  );
}

export default App;