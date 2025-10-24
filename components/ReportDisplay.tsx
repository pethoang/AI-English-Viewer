import React from 'react';
import { CheckIcon, ErrorIcon, WarningIcon } from './icons';

interface ReportDisplayProps {
  content: string;
}

const ReportDisplay: React.FC<ReportDisplayProps> = ({ content }) => {
  // Remove markdown backticks and <br> tags if they exist
  const cleanedContent = content
    .replace(/^```markdown\n/, '')
    .replace(/\n```$/, '')
    .replaceAll(/<br\s*\/?>/gi, '\n');

  const sections = cleanedContent.split('\n\n');
  const gradeSection = sections.find(s => s.startsWith('Detected grade:'));
  const mismatchWarningSection = sections.find(s => s.startsWith('⚠️ **CẢNH BÁO:'));
  const reportHeader = sections.find(s => s.startsWith('🧾 **BÁO CÁO DUYỆT ĐỀ**'));
  const tableSection = sections.find(s => s.startsWith('| Hạng mục'));
  const suggestionsSection = sections.find(s => s.startsWith('💡 **Gợi ý chỉnh sửa:**'));

  if (!reportHeader || !tableSection || !suggestionsSection) {
    // Fallback for unexpected format: render as pre-formatted text
    return (
      <div className="prose prose-slate max-w-none">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Báo cáo phân tích</h2>
        <pre className="whitespace-pre-wrap bg-slate-50 p-4 rounded-lg text-sm">{content}</pre>
      </div>
    );
  }

  // Parse Mismatch Warning
  let mismatchDetails: Record<string, string> = {};
  if (mismatchWarningSection) {
      const mismatchLines = mismatchWarningSection.split('\n').slice(1); // Skip the title
      mismatchDetails = mismatchLines.reduce((acc, line) => {
          const match = line.match(/- \*\*(.*?):\*\* (.*)/);
          if (match) {
              acc[match[1].trim()] = match[2].trim();
          }
          return acc;
      }, {} as Record<string, string>);
  }

  // Parse table
  const tableRows = tableSection.split('\n').slice(2); // Skip header and separator
  const tableData = tableRows.map(row => {
    const columns = row.split('|').map(c => c.trim()).slice(1, -1); // Remove empty start/end columns
    return {
      category: columns[0] || '',
      analysis: columns[1] || '',
      result: columns[2] || '',
    };
  });
  
  // Parse report header details
  const reportHeaderLines = reportHeader.split('\n').slice(1);
  const reportDetails = reportHeaderLines.reduce((acc, line) => {
      const match = line.match(/- \*\*(.*?):\*\* (.*)/);
      if (match) {
        acc[match[1].trim()] = match[2].trim();
      }
      return acc;
  }, {} as Record<string, string>);

  // Parse suggestions
  const suggestions = suggestionsSection.split('\n').slice(1).map(s => s.replace(/^- /, ''));

  const renderResultIcon = (result: string) => {
    switch (result.trim()) {
      case '✓':
        return <CheckIcon />;
      case '⚠️':
        return <WarningIcon />;
      case '✗':
        return <ErrorIcon />;
      default:
        return <span className="text-sm font-semibold">{result}</span>;
    }
  };

  const MismatchWarning = () => (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 rounded-r-lg" role="alert">
      <div className="flex">
        <div className="py-1">
          <svg className="h-6 w-6 text-yellow-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <p className="font-bold text-yellow-800">Cảnh báo: Nội dung không phù hợp với lớp đã chọn</p>
          <div className="text-sm text-yellow-700 space-y-1 mt-1">
             {mismatchDetails['Lớp đã chọn'] && <p><span className="font-semibold">Lớp đã chọn:</span> {mismatchDetails['Lớp đã chọn']}</p>}
             {mismatchDetails['Lớp đề xuất'] && <p><span className="font-semibold">Lớp đề xuất:</span> {mismatchDetails['Lớp đề xuất']}</p>}
             {mismatchDetails['Lý do'] && <p><span className="font-semibold">Lý do:</span> {mismatchDetails['Lý do']}</p>}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {mismatchWarningSection && <MismatchWarning />}
      
      <div>
        <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Báo cáo duyệt đề</h2>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-600">
            {reportDetails['Môn học'] && <p><span className="font-semibold">Môn học:</span> {reportDetails['Môn học']}</p>}
            {reportDetails['Chương trình'] && <p><span className="font-semibold">Chương trình:</span> {reportDetails['Chương trình']}</p>}
            {reportDetails['Lớp'] && <p><span className="font-semibold">Lớp:</span> {reportDetails['Lớp']}</p>}
        </div>
        {gradeSection && <p className="text-sm text-slate-500 mt-1">{gradeSection.replace('Detected grade:', 'Ghi chú từ AI:')}</p>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 font-bold text-slate-700 border-b-2 border-slate-200">Hạng mục</th>
              <th className="p-4 font-bold text-slate-700 border-b-2 border-slate-200">Phân tích</th>
              <th className="p-4 font-bold text-slate-700 border-b-2 border-slate-200 text-center">Kết quả</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr key={index} className="border-b border-slate-200 hover:bg-slate-50">
                <td className="p-4 font-semibold text-slate-800 align-top w-1/4">{row.category}</td>
                <td className="p-4 text-slate-600 align-top w-1/2">{row.analysis}</td>
                <td className="p-4 text-center align-top w-1/4">{renderResultIcon(row.result)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-slate-800 mb-3">💡 Gợi ý chỉnh sửa</h3>
        <ul className="list-disc list-inside space-y-2 text-slate-700">
          {suggestions.filter(s => s.trim()).map((suggestion, index) => (
            <li key={index}>{suggestion}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ReportDisplay;