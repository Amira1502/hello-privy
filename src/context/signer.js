import { Account, PublicKey, Signer } from 'near-api-js'
import { bytesToHex, hexToBytes } from '@noble/hashes/utils'

// Keep Privy's embedded wallet as the signer. The SDK handles transaction,
// delegate-action and NEP-413 serialization and hashing consistently.
export class privySigner extends Signer {
  constructor(signRawHash, nearAccId, provider) {
    super()
    this.signRawHash = signRawHash
    this.nearAccId = nearAccId
    this.provider = provider
  }

  async getPublicKey() {
    if (/^[a-f0-9]{64}$/i.test(this.nearAccId)) {
      return new PublicKey({ keyType: 0, data: hexToBytes(this.nearAccId) })
    }
    const account = new Account(this.nearAccId, this.provider)
    const { keys } = await account.getAccessKeyList()
    if (!keys.length) throw new Error('The account has no registered access key')
    return PublicKey.fromString(keys[0].public_key)
  }

  async signBytes(bytes) {
    const { signature } = await this.signRawHash({
      address: this.nearAccId,
      chainType: 'near',
      hash: `0x${bytesToHex(bytes)}`,
    })
    return hexToBytes(signature.replace(/^0x/, ''))
  }
}
