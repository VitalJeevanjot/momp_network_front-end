
// import something here
// const { Universal: Ae, Node } = require('@aeternity/aepp-sdk')
import { RpcAepp, Node } from '@aeternity/aepp-sdk/es'
import BrowserWindowMessageConnection from '@aeternity/aepp-sdk/es/utils/aepp-wallet-communication/connection/browser-window-message'
import Detector from '@aeternity/aepp-sdk/es/utils/aepp-wallet-communication/wallet-detector'
// "async" is optional;
// more info on params: https://quasar.dev/quasar-cli/boot-files
export default async ({ app }) => {
  // something to do
  // app.config.globalProperties.$node = Node({ url: 'https://testnet.aeternity.io', internalUrl: 'https://testnet.aeternity.io' })
  // app.config.globalProperties.$ae = Aepp
  // app.config.globalProperties.$browser_message = BrowserWindowMessageConnection
  app.config.globalProperties.$browser_message = BrowserWindowMessageConnection
  app.config.globalProperties.$detector = Detector
  app.config.globalProperties.$rpc_aepp = RpcAepp
  app.config.globalProperties.$node = Node
}