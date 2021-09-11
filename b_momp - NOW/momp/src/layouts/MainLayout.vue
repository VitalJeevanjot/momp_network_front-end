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
      console.log("starting getOwnerOfToken...")
      console.log(this.contract)
      var token_owner = await this.contract.methods.ownerOfToken.get("abc")
      console.log(token_owner)
      console.log(token_owner.decodedResult)
    },
    async initProvider () {
      try {
        console.log("Starting init provider...")
        const networkId = (await this.client.getNodeInfo()).nodeNetworkId
        this.network_id = networkId
        console.log(this.network_id)
        console.log(this.$contract_address)
        let _contractAddress = this.$contract_address
        this.contract = await this.client.getContractInstance(this.$contract_code, { contractAddress: _contractAddress })
        console.log("Instance created")
        await this.getOwnerOfToken()
        return true
      } catch (e) {
        console.log("got errori...")
        console.error(e)
        return false
      }
    },
    async scanForWallets () {
      console.log("Starting Scan for wallet...")
      const scannerConnection = await this.$BrowserWindowMessageConnection({
        connectionInfo: { id: 'spy' },
      });
      const detector = await this.$WalletDetector({ connection: scannerConnection })

    detector.scan(async ({ newWallet }) => {
        if (!newWallet) return;
        await this.client.connectToWallet(await newWallet.getConnection());
        await this.client.subscribeAddress('subscribe', 'current');
        const address = this.client.rpcClient.getCurrentAccount();
        console.log("wallet-address")
        console.log(address)
        if (!address) return;
        console.log(this.client)
        this.initProvider()
      })
    }
  },
  async mounted () {
    console.log("Starting mounted...")
     const options = {
        nodes: [{ name: 'node', instance: await this.$Node({ url: this.testnet_url }) }],
        compilerUrl: this.compiler_url,
      };
      const instance = await this.$RpcAepp({
          ...options,
          name: 'Superhero',
          onDisconnect() {
            console.log("Wallet disconnected!")
          },
          async onAddressChange(accounts) {
            const address = Object.keys(accounts.current)[0];
            console.log(address)
          },
      })
    this.client = instance
    this.scanForWallets()
  }
})
</script>
