
import React from 'react';
import { CheckIcon, ErrorIcon, WarningIcon } from './icons';

interface ReportDisplayProps {
  content: string;
}

const ReportDisplay: React.FC<ReportDisplayProps> = ({ content }) => {
  // Clean content and handle bold markers in headers
  const cleanedContent = content
    .replace(/^```markdown\n/, '')
    .replace(/\n```$/, '')
    .replaceAll(/<br\s*\/?>/gi, '\n');

  const sections = cleanedContent.split('\n\n');
  const gradeSection = sections.find(s => s.toLowerCase().includes('detected grade:'));
  const mismatchWarningSection = sections.find(s => s.includes('⚠️') && s.includes('CẢNH BÁO'));
  const reportHeader = sections.find(s => s.includes('🧾') && s.includes('BÁO CÁO DUYỆT ĐỀ'));
  const tableSection = sections.find(s => s.includes('| Hạng mục'));
  const suggestionsSection = sections.find(s => s.includes('💡') && s.includes('Gợi ý chỉnh sửa'));

  if (!reportHeader || !tableSection || !suggestionsSection) {
    return (
      <div className="prose prose-slate max-w-none">
        <h2 className="text-2xl font-bold text-slate-800 mb-4 border-b pb-2 text-blue-600">Báo cáo phân tích</h2>
        <div className="whitespace-pre-wrap bg-slate-50 p-6 rounded-xl text-slate-700 leading-relaxed border border-slate-200">
          {cleanedContent}
        </div>
      </div>
    );
  }

  // Parse Mismatch Warning
  let mismatchDetails: Record<string, string> = {};
  if (mismatchWarningSection) {
      const lines = mismatchWarningSection.split('\n');
      lines.forEach(line => {
          const match = line.match(/[-*]\s+\*\*(.*?):\*\*\s+(.*)/);
          if (match) mismatchDetails[match[1].trim()] = match[2].trim();
      });
  }

  // Parse table
  const tableRows = tableSection.split('\n').filter(l => l.includes('|') && !l.includes('---'));
  const tableData = tableRows.slice(1).map(row => {
    const columns = row.split('|').map(c => c.trim()).slice(1, -1);
    return {
      category: columns[0] || '',
      analysis: columns[1] || '',
      result: columns[2] || '',
    };
  });
  
  // Parse report header details
  let reportDetails: Record<string, string> = {};
  if (reportHeader) {
      const lines = reportHeader.split('\n');
      lines.forEach(line => {
          const match = line.match(/[-*]\s+\*\*(.*?):\*\*\s+(.*)/);
          if (match) reportDetails[match[1].trim()] = match[2].trim();
      });
  }

  // Parse suggestions
  const suggestions = suggestionsSection.split('\n').slice(1).map(s => s.replace(/^[-*]\s+/, '').trim());

  const renderResultIcon = (result: string) => {
    const r = result.trim();
    if (r.includes('✓')) return <CheckIcon />;
    if (r.includes('⚠️')) return <WarningIcon />;
    if (r.includes('✗')) return <ErrorIcon />;
    return <span className="text-sm font-semibold text-slate-500">{r || 'N/A'}</span>;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {mismatchWarningSection && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-5 rounded-r-xl shadow-sm" role="alert">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-bold text-amber-800">Cảnh báo: Nội dung không phù hợp</h3>
              <div className="text-sm text-amber-700 space-y-1 mt-1">
                 {Object.entries(mismatchDetails).map(([key, val]) => (
                   <p key={key}><span className="font-bold">{key}:</span> {val}</p>
                 ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div>
        <h2 className="text-3xl font-extrabold text-slate-800 mb-4 flex items-center gap-2">
          <span className="text-blue-600">🧾</span> Báo cáo duyệt đề
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Môn học</span>
              <span className="text-slate-700 font-medium">{reportDetails['Môn học'] || 'Tiếng Anh'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chương trình</span>
              <span className="text-slate-700 font-medium">{reportDetails['Chương trình'] || 'Global Success'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lớp</span>
              <span className="text-slate-700 font-medium">{reportDetails['Lớp'] || 'Chưa xác định'}</span>
            </div>
        </div>
        {gradeSection && (
          <p className="text-xs text-slate-500 mt-3 italic flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"></path></svg>
            {gradeSection.replace(/detected grade:/i, 'Ghi chú AI:')}
          </p>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-100 border-b border-slate-200">
            <tr>
              <th className="p-4 font-bold text-slate-700 w-1/4">Hạng mục</th>
              <th className="p-4 font-bold text-slate-700 w-1/2">Phân tích chi tiết</th>
              <th className="p-4 font-bold text-slate-700 text-center w-1/4">Đánh giá</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tableData.map((row, index) => (
              <tr key={index} className="bg-white hover:bg-slate-50/50 transition-colors">
                <td className="p-4 font-bold text-slate-800 align-top">{row.category}</td>
                <td className="p-4 text-slate-600 align-top text-sm leading-relaxed">{row.analysis}</td>
                <td className="p-4 text-center align-top">{renderResultIcon(row.result)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
        <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="text-yellow-500">💡</span> Gợi ý chỉnh sửa chuyên môn
        </h3>
        <ul className="space-y-3">
          {suggestions.filter(s => s.length > 0).map((suggestion, index) => (
            <li key={index} className="flex gap-3 text-slate-700 items-start">
              <span className="text-blue-500 font-bold">•</span>
              <span className="text-sm leading-relaxed">{suggestion}</span>
            </li>
          ))}
          {suggestions.filter(s => s.length > 0).length === 0 && (
            <li className="text-slate-500 italic text-sm">Đề thi đã được chuẩn bị tốt, không có gợi ý chỉnh sửa thêm.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ReportDisplay;
