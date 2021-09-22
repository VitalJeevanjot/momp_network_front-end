
// import something here
// const { Universal: Ae, Node } = require('@aeternity/aepp-sdk')
import {
  MemoryAccount, Node, Universal, RpcAepp, Crypto, WalletDetector, BrowserWindowMessageConnection,
} from '@aeternity/aepp-sdk';

// "async" is optional;
// more info on params: https://quasar.dev/quasar-cli/boot-files
export default async ({ app }) => {
  // something to do
  // app.config.globalProperties.$node = Node({ url: 'https://testnet.aeternity.io', internalUrl: 'https://testnet.aeternity.io' })
  // app.config.globalProperties.$ae = Aepp
  // app.config.globalProperties.$browser_message = BrowserWindowMessageConnection
  app.config.globalProperties.$BrowserWindowMessageConnection = BrowserWindowMessageConnection
  app.config.globalProperties.$WalletDetector = WalletDetector
  app.config.globalProperties.$RpcAepp = RpcAepp
  app.config.globalProperties.$Node = Node
  app.config.globalProperties.$Universal = Universal

  app.config.globalProperties.$client = null
  app.config.globalProperties.$contract = null
  app.config.globalProperties.$testnet_url = 'https://testnet.aeternity.io'
  app.config.globalProperties.$mainnet_url = 'https://mainnet.aeternity.io'
  app.config.globalProperties.$compiler_url = 'https://latest.compiler.aepps.com'
}