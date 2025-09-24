// NEARxPrivy.tsx
import { usePrivy } from '@privy-io/react-auth';
import { useCreateWallet, useSignRawHash } from '@privy-io/react-auth/extended-chains';
import { JsonRpcProvider } from '@near-js/providers';
import { Account } from '@near-js/accounts';
import { useEffect, useState, ReactNode } from 'react';
import { NearContext } from './useNear';
import { providerUrl } from '../config';
import { privySigner } from './signer';

// Create a NEAR provider instance
const provider = new JsonRpcProvider({ url: providerUrl });

// Props type
type NEARxPrivyProps = {
  children: ReactNode;
};

export function NEARxPrivy({ children }: NEARxPrivyProps) {
  const { authenticated, user } = usePrivy();
  const [walletId, setWalletId] = useState<string>('');
  const [nearAccount, setNearAccount] = useState<Account | null>(null);

  const { signRawHash } = useSignRawHash();
  const { createWallet } = useCreateWallet();

  useEffect(() => {
    if (authenticated) {
      if (!user?.wallet) {
        createWallet({ chainType: 'near' });
      } else {
        // Create a privy signer instance
        const signerInstance = new privySigner(signRawHash, user.wallet.address, provider);

        // Wrap signer to implement all required NEAR methods
        const signerWrapper = {
          getPublicKey: signerInstance.getPublicKey.bind(signerInstance),
          signTransaction: signerInstance.signTransaction.bind(signerInstance),
          // Optional unsupported NEAR methods
          async signNep413Message(_: Uint8Array) {
            throw new Error('signNep413Message is not supported by privySigner');
          },
          async signDelegateAction(_: any) {
            throw new Error('signDelegateAction is not supported by privySigner');
          },
        };

        // Create the NEAR account with the wrapped signer
        const acc = new Account(user.wallet.address, provider, signerWrapper as any);
        setNearAccount(acc);
        setWalletId(user.wallet.address);
      }
    } else {
      setWalletId('');
      setNearAccount(null);
    }
  }, [authenticated, user, createWallet, signRawHash]);

  return (
    <NearContext.Provider value={{ provider, nearAccount, walletId }}>
      {children}
    </NearContext.Provider>
  );
}
