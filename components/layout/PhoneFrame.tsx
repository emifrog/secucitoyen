'use client';

import { ReactNode } from 'react';

interface PhoneFrameProps {
  children: ReactNode;
}

export default function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-[428px] min-h-[926px] bg-white rounded-[3rem] shadow-2xl overflow-hidden relative border-8 border-gray-800">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-2xl z-[60]" />
        {/* Screen content */}
        <div className="h-full pt-6">
          {children}
        </div>
      </div>
    </div>
  );
}
