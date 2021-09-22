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
    <div class="row justify-center">
    <p class="text-h6 text-red">{{this.testnet}}</p> 
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
      testnet: null
    }
  },
  setup () {

  },
  methods: {
    async getFees() {
      // console.log("starting getFees...")
      // console.log(window.$contract)
      try {
        let base_fee = await window.$contract.methods.get_base_fee()
        window.$base_fee = base_fee.decodedResult
        let registration_fee = await window.$contract.methods.get_registration_fee()
        window.$registration_fee = registration_fee.decodedResult
        this.$q.notify({
          message: 'Data Loaded!',
          color: 'grey-10'
        })
      } catch (e) {
        console.log(e)
        this.$q.notify({
          message: 's1: ' + e.message,
          color: 'pink-8'
        })
        this.$q.notify({
          message: 's1.1: Error while fetching data...',
          color: 'pink-10'
        })
      }
      // console.log(base_fee)
      
      console.log(window.$base_fee)
      console.log(window.$registration_fee)
    },
    async initProvider () {
      try {
        console.log("Starting init provider...")
        const networkId = (await window.$client.getNodeInfo()).nodeNetworkId
        this.$network_id = networkId
        console.log(this.$network_id)
        // if(this.$network_id != "ae_mainnet") {
        //   this.testnet = "Wrong network!"
        // }
        console.log(this.$contract_address)
        let _contractAddress = this.$contract_address
        window.$contract = await window.$client.getContractInstance(this.$contract_code, { contractAddress: _contractAddress })
        console.log("Instance created")
        await this.getFees()
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
        await window.$client.connectToWallet(await newWallet.getConnection());
        await window.$client.subscribeAddress('subscribe', 'current');
        window.$address = window.$client.rpcClient.getCurrentAccount();
        console.log("wallet-address")
        console.log(window.$address)
        this.initProvider()
      })
    }
  },
  async mounted () {
    console.log("Starting mounted...")
     const options = {
        nodes: [{ name: 'node', instance: await this.$Node({ url: this.$testnet_url }) }],
        compilerUrl: this.$compiler_url,
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
    window.$client = instance
    this.scanForWallets()
  }
})
</script>
