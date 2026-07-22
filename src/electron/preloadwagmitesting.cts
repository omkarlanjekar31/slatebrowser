const { contextBridge } = require('electron')
const { EventEmitter } = require('events')

class MockEthereumProvider extends EventEmitter {
  constructor() {
    super()

    this.isMetaMask = true
    this._connected = false
    this._accounts = ['0x1234567890abcdef1234567890abcdef12345678']
    this._chainId = '0x1' // Ethereum Mainnet
  }

  // ---- EIP-1193 required method ----
  async request({ method, params }:any) {
    switch (method) {
      case 'eth_requestAccounts':
        this._connected = true
        this.emit('accountsChanged', this._accounts)
        return this._accounts

      case 'eth_accounts':
        return this._connected ? this._accounts : []

      case 'eth_chainId':
        return this._chainId

      case 'wallet_switchEthereumChain':
        const newChainId = params?.[0]?.chainId
        if (!newChainId) throw { code: 4902, message: 'Chain not found' }

        this._chainId = newChainId
        this.emit('chainChanged', newChainId)
        return null

      case 'wallet_addEthereumChain':
        const chain = params?.[0]
        this._chainId = chain.chainId
        this.emit('chainChanged', chain.chainId)
        return null

      case 'wallet_requestPermissions':
        return [
          {
            caveats: [
              {
                type: 'restrictReturnedAccounts',
                value: this._accounts,
              },
            ],
          },
        ]

      case 'wallet_revokePermissions':
        this._connected = false
        this.emit('accountsChanged', [])
        return null

      default:
        throw {
          code: 4200,
          message: `Unsupported method: ${method}`,
        }
    }
  }

  // ---- Optional helpers ----
  isConnected() {
    return this._connected
  }

  // EIP-1193 compatibility
  removeListener(event:any, listener:any) {
    this.off(event, listener)
  }
}

const provider = new MockEthereumProvider()

contextBridge.exposeInMainWorld('ethereum', provider)