import React, { createContext, useContext, useState, useCallback } from 'react';

export interface ResumeItem {
  path: string;
  readerType: 'read' | 'cbz';
  currentPage: number;
}

interface ResumeContextType {
  resumeItem: ResumeItem | null;
  triggerResume: (item: ResumeItem) => void;
  clearResume: () => void;
}

const ResumeContext = createContext<ResumeContextType | null>(null);

export function ResumeProvider({ children }: { children: React.ReactNode }) {
  const [resumeItem, setResumeItem] = useState<ResumeItem | null>(null);

  const triggerResume = useCallback((item: ResumeItem) => {
    setResumeItem(item);
  }, []);

  const clearResume = useCallback(() => {
    setResumeItem(null);
  }, []);

  return (
    <ResumeContext.Provider value={{ resumeItem, triggerResume, clearResume }}>
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume() {
  const ctx = useContext(ResumeContext);
  if (!ctx) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return ctx;
}
