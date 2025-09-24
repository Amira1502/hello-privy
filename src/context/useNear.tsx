import { createContext, useContext } from 'react'
import type { Account } from '@near-js/accounts'
import type { JsonRpcProvider } from '@near-js/providers'

interface NearContextType {
  walletId: string
  nearAccount: Account | null
  provider: JsonRpcProvider | null
}

export const NearContext = createContext<NearContextType>({
  walletId: '',
  nearAccount: null,
  provider: null,
})

export function useNEAR() {
  const context = useContext(NearContext)
  if (!context) {
    throw new Error('useNEAR must be used within a <NEARxPrivy> provider')
  }
  return context
}
