'use client';

import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';

type SuggestionInputProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string; // Add className prop
};

export function SuggestionInput({
  id,
  value,
  onChange,
  options,
  placeholder,
  disabled,
  required,
  className, // Destructure className
}: SuggestionInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLUListElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleSelectSuggestion = (option: string) => {
    onChange(option);
    setShowSuggestions(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="relative">
      <input
        id={id}
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setShowSuggestions(false)}
        className={className} // Apply className here
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete="off" // Prevent browser's autocomplete
      />
      {showSuggestions && (
        <ul
          ref={suggestionsRef}
          className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1"
        >
          {options.map((option, index) => (
            <li
              key={option}
              className={`p-2 cursor-pointer hover:bg-blue-100`}
              onPointerDown={() => handleSelectSuggestion(option)}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
