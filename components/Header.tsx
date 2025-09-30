import React from 'react';
import { ShirtIcon } from './Icons';

export const Header: React.FC = () => {
  return (
    <header className="bg-gray-800/30 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-center">
        <ShirtIcon className="w-8 h-8 text-indigo-400 mr-3" />
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
          AI Virtual Try-On
        </h1>
      </div>
    </header>
  );
};
