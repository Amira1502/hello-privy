// signer.ts
import { Account } from '@near-js/accounts';
import { Signature, SignedTransaction, Transaction } from '@near-js/transactions';
import { JsonRpcProvider } from '@near-js/providers';
import { sha256 } from '@noble/hashes/sha2';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';

// Input type for signRawHash
export interface SignRawHashInput {
  address: string;
  chainType: 'near';
  hash: `0x${string}`; // Hex string prefixed with 0x
}

// Output type for signRawHash
export interface SignRawHashOutput {
  signature: string;
}

// Function type for external signing
export type SignRawHashFn = (args: SignRawHashInput) => Promise<SignRawHashOutput>;

export class privySigner {
  private signRawHash: SignRawHashFn;
  private nearAccId: string;
  private provider: JsonRpcProvider;

  constructor(signRawHash: SignRawHashFn, nearAccId: string, provider: JsonRpcProvider) {
    this.signRawHash = signRawHash;
    this.nearAccId = nearAccId;
    this.provider = provider;
  }

  // Must exist so Account can call it
  async getPublicKey(): Promise<string> {
    const account = new Account(this.nearAccId, this.provider);
    const keys = await account.getAccessKeyList();
    if (!keys.keys.length) throw new Error('No access keys found for this account');
    return keys.keys[0].public_key;
  }

  // Must exist so Account can call it
  async signTransaction(transaction: Transaction): Promise<[any[], SignedTransaction]> {
    const encoded = transaction.encode();
    const txHash = bytesToHex(sha256(encoded));

    const signatureRaw = await this.signRawHash({
      address: this.nearAccId,
      chainType: 'near',
      hash: `0x${txHash}`,
    });

    const signature = new Signature({
      keyType: transaction.publicKey.keyType,
      data: hexToBytes(signatureRaw.signature.slice(2)), 
    });

    return [[], new SignedTransaction({ transaction, signature })];
  }
}
