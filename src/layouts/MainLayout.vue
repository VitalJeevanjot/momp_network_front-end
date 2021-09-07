<template>
  <q-layout view="lHh Lpr lFf" class="bg-brown-1">

    <q-page-container>
      <div class="row justify-center">
      <img
      alt="Quasar logo"
      src="~assets/logo.svg"
      style="width: 15rem; height: 15rem"
    >
    </div>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style lang="scss">
.text-moipl {
  color: #ca9d3b;
}
.bg-moipl {
  background: #ca9d3b;
}
.text-moipd {
  color: #4A171E;
}
.bg-moipd {
  background: #4A171E;
}
</style>

<script>
export default ({
  name: 'MainLayout',

  components: {
  },
  data () {
    return {
      client: null,
      contract: null,
      testnet_url: 'https://testnet.aeternity.io',
      mainnet_url: 'https://mainnet.aeternity.io',
      compiler_url: 'https://latest.compiler.aepps.com',
    }
  },
  setup () {

  },
  methods: {
    async getOwnerOfToken() {
      console.log("starting...")
      var token_owner = (await this.contract.methods.ownerOfToken.get("abc")).decodedResult
      console.log(token_owner)
    },
    async initProvider () {
      try {
        const networkId = (await this.client.getNodeInfo()).nodeNetworkId
        this.network_id = networkId
        console.log(this.network_id)
        console.log(this.$contract_address)
        this.contract = await this.client.getContractInstance(this.$contract_code, { contractAddress: this.$contract_address })
        await this.getOwnerOfToken()
        return true
      } catch (e) {
        console.log("got error")
        console.error(e)
        return false
      }
    },
    async scanForWallets () {
      const scannerConnection = await this.$browser_message({
        connectionInfo: { id: 'spy' }
      })
      const detector = await this.$detector({ connection: scannerConnection })
      const handleWallets = async ({ wallets, newWallet }) => {
        await detector.stopScan()
        const connected = await this.rpc_client.connectToWallet(await wallets[Object.keys(wallets)[0]].getConnection())
        await this.rpc_client.selectNode(connected.networkId) // connected.networkId needs to be defined as node in RpcAepp
        await this.rpc_client.subscribeAddress('subscribe', 'current')
        this.client = this.rpc_client
        console.log(this.client)
        await this.initProvider()
      }
      detector.scan(handleWallets)
    }
  },
  async mounted () {
    console.log('-----------------')
    this.rpc_client = await this.$rpc_aepp({
      name: 'AEPP',
      nodes: [
        { name: 'ae_mainnet', instance: await this.$node({ url: this.mainnet_url }) },
        { name: 'ae_uat', instance: await this.$node({ url: this.testnet_url }) }
      ],
      compilerUrl: this.compiler_url,
      onNetworkChange (params) {
        console.log(params)
        // aeternity.initProvider();
      },
      onAddressChange (addresses) {
        // if (!addresses.current[aeternity.address]) {
        //   console.log('address changed')
        // }
      }
    })
    this.scanForWallets()
  }
})
</script>
