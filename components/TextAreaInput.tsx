
import React from 'react';

interface TextAreaInputProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const TextAreaInput: React.FC<TextAreaInputProps> = ({ id, label, placeholder, value, onChange }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-lg font-semibold text-slate-700 mb-2">
        {label}
      </label>
      <textarea
        id={id}
        rows={10}
        className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200 text-sm text-slate-800 bg-slate-50"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      ></textarea>
    </div>
  );
};

export default TextAreaInput;
