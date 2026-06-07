'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useState } from 'react';

const QueryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Must be inside component so each browser/request gets its own instance.
    // A module-level singleton leaks server-side cache between users in Next.js SSR.
    const [queryClient] = useState(() => new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000,
          refetchOnWindowFocus: false,
        }
      }
    }));
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
};

export default QueryProvider;