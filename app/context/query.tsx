import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const queryClient = new QueryClient();

/**
 * Provides TanStack Query context to children.
 * @param children - React children
 * @returns Provider component
 */
const QueryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

export { QueryProvider, queryClient };
export default QueryProvider;
