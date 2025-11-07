
import React from 'react';
import { Card } from '@/components/ui/card';

interface SearchSectionProps {
  children: React.ReactNode;
}

export function SearchSection({ children }: SearchSectionProps) {
  return (
    <Card className="p-6 shadow-md border-brahmin-accent">
      {children}
    </Card>
  );
}
