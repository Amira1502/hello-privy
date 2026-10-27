// Privy
import { usePrivy } from '@privy-io/react-auth'
import { useCreateWallet } from '@privy-io/react-auth/extended-chains'
import { useSignRawHash } from '@privy-io/react-auth/extended-chains'

// near api js
import { JsonRpcProvider } from 'near-api-js'
import { Account } from 'near-api-js'

// config
import { useEffect, useRef } from 'react'
import { useState } from 'react'
import { NearContext } from './useNear'
import { providerUrl } from '../config'
import { privySigner } from './signer'

// Provider
const provider = new JsonRpcProvider({ url: providerUrl })

// eslint-disable-next-line react/prop-types
export function NEARxPrivy({ children }) {
  const { authenticated, user } = usePrivy()
  const [walletId, setWalletId] = useState('')
  const [nearAccount, setNearAccount] = useState(null)

  const { signRawHash } = useSignRawHash()
  const { createWallet } = useCreateWallet()
  const creatingWallet = useRef(false)

  useEffect(() => {
    if (!authenticated || !user) {
      setWalletId('')
      setNearAccount(null)
      return
    }

    // A user may also have an Ethereum/Solana wallet. Select the NEAR wallet
    // explicitly rather than treating the first linked wallet as a NEAR account.
    const nearWallet = user.linkedAccounts.find((account) =>
      account.type === 'wallet' && account.chainType === 'near'
    )
    if (!nearWallet) {
      if (!creatingWallet.current) {
        creatingWallet.current = true
        createWallet({ chainType: 'near' })
          .catch((error) => console.error('Could not create NEAR wallet', error))
          .finally(() => { creatingWallet.current = false })
      }
      return
    }

    const signer = new privySigner(signRawHash, nearWallet.address, provider)
    setNearAccount(new Account(nearWallet.address, provider, signer))
    setWalletId(nearWallet.address)
  }, [authenticated, user, createWallet, signRawHash])

  return (
    <NearContext.Provider value={{ provider, nearAccount, walletId }}>
      {children}
    </NearContext.Provider>
  )
}
