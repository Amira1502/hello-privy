import { Account } from '@near-js/accounts';
import { Signature, SignedTransaction, Transaction } from '@near-js/transactions';
import { JsonRpcProvider } from '@near-js/providers';
import { sha256 } from '@noble/hashes/sha2';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';

// Define the input shape for the signRawHash function
export interface SignRawHashInput {
  address: string;
  chainType: 'near';
  hash: `0x${string}`; // Literal type for hex strings starting with 0x
}

// Define the output shape from the signRawHash function
export interface SignRawHashOutput {
  signature: string;
}

// Function type for the signer callback
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

  // Fetch the public key from the NEAR account
  async getPublicKey(): Promise<string> {
    const account = new Account(this.nearAccId, this.provider);
    const keys = await account.getAccessKeyList();
    return keys.keys[0].public_key;
  }

  // Sign a transaction using the external signRawHash function
  async signTransaction(transaction: Transaction): Promise<[any[], SignedTransaction]> {
    const encoded = transaction.encode();
    const txHash = bytesToHex(sha256(encoded)); // Calculate tx hash

    const signatureRaw = await this.signRawHash({
      address: this.nearAccId,
      chainType: 'near',
      hash: `0x${txHash}`, // Must be hex string prefixed with 0x
    });

    const signature = new Signature({
      keyType: transaction.publicKey.keyType,
      data: hexToBytes(signatureRaw.signature.slice(2)), // Remove '0x' prefix before converting
    });

    return [[], new SignedTransaction({ transaction, signature })];
  }
}
