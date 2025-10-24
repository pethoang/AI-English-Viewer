
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <div className="container mx-auto px-4 md:px-8 py-6 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-blue-600">
          AI English Test Reviewer
        </h1>
        <p className="mt-2 text-md md:text-lg text-slate-600">
          Công cụ duyệt đề thi Tiếng Anh Global Success (Lớp 6-9) dành cho giáo viên
        </p>
      </div>
    </header>
  );
};

export default Header;
