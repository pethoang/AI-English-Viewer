import React from 'react';

interface GradeSelectorProps {
  selectedGrade: string | null;
  onGradeChange: (grade: string | null) => void;
}

const GRADES = ['6', '7', '8', '9'];

const GradeSelector: React.FC<GradeSelectorProps> = ({ selectedGrade, onGradeChange }) => {
  return (
    <div>
      <label className="block text-lg font-semibold text-slate-700 mb-2">
        Chọn khối lớp (tùy chọn)
      </label>
      <div className="flex flex-wrap gap-3">
        {GRADES.map((grade) => (
          <button
            key={grade}
            type="button"
            onClick={() => onGradeChange(selectedGrade === grade ? null : grade)}
            className={`px-6 py-2 rounded-full font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              selectedGrade === grade
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
            }`}
          >
            Lớp {grade}
          </button>
        ))}
      </div>
       <p className="text-xs text-slate-500 mt-2">Chọn một khối lớp để AI phân tích chính xác hơn.</p>
    </div>
  );
};

export default GradeSelector;
