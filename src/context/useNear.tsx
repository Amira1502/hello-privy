// useNear.tsx
import { createContext, useContext } from 'react';
import type { Account } from '@near-js/accounts';
import type { JsonRpcProvider } from '@near-js/providers';

// Define the shape of the context
interface NearContextType {
  nearAccount: Account | null;
  walletId: string;
  provider: JsonRpcProvider | null;
}

// Create the context with default values
export const NearContext = createContext<NearContextType>({
  walletId: '',
  nearAccount: null,
  provider: null,
});

// Hook to consume the context
export function useNEAR(): NearContextType {
  const context = useContext(NearContext);
  if (!context) {
    throw new Error('useNEAR must be used within a <NEARxPrivy> provider');
  }
  return context;
}
