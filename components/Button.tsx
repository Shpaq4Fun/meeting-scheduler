
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, ...props }) => {
  return (
    <button
      {...props}
      className="bg-blue-600 text-xl text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
};
