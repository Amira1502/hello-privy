// Privy 
import { usePrivy } from '@privy-io/react-auth'
import { useCreateWallet } from '@privy-io/react-auth/extended-chains'
import { useSignRawHash } from '@privy-io/react-auth/extended-chains'

// near api js
import { JsonRpcProvider } from '@near-js/providers'
import { Account } from '@near-js/accounts'

// React
import { useEffect, useState, ReactNode } from 'react'

// Config and Context
import { NearContext } from './useNear'
import { providerUrl } from '../config'
import { privySigner } from './signer'

// Provider
const provider = new JsonRpcProvider({ url: providerUrl })

// Define props for the component
type NEARxPrivyProps = {
  children: ReactNode
}

export function NEARxPrivy({ children }: NEARxPrivyProps) {
  const { authenticated, user } = usePrivy()
  const [walletId, setWalletId] = useState<string>('')
  const [nearAccount, setNearAccount] = useState<Account | null>(null)

  const { signRawHash } = useSignRawHash()
  const { createWallet } = useCreateWallet()

  useEffect(() => {
    if (authenticated) {
      if (!user?.wallet) {
        createWallet({ chainType: 'near' })
      } else {
        let signer = new privySigner(signRawHash, user.wallet.address, provider)

        // Wrap the privySigner to provide the additional methods expected by the NEAR Signer interface.
        // These implementations intentionally throw so the runtime will surface unsupported operations,
        // but they satisfy TypeScript's structural typing requirements.
        const signerWrapper = {
          ...signer,
          async signNep413Message(_: Uint8Array) {
            throw new Error('signNep413Message is not supported by privySigner')
          },
          async signDelegateAction(_: any) {
            throw new Error('signDelegateAction is not supported by privySigner')
          }
        }

        let acc = new Account(user.wallet.address, provider, signerWrapper as any)
        setNearAccount(acc)
        setWalletId(user.wallet.address)
      }
    } else {
      setWalletId('')
      setNearAccount(null)
    }
  }, [authenticated, user, createWallet, signRawHash])

  return (
    <NearContext.Provider value={{ provider, nearAccount, walletId }}>
      {children}
    </NearContext.Provider>
  )
}
