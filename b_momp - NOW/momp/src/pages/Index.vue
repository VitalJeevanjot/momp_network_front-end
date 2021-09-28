<template>
  <q-page>
  <div class="row justify-center">
    <a href="https://twitter.org/genievot" target="_blank" style="text-decoration: none">
    <q-btn icon="group_add" color="amber-7" flat round>
      </q-btn>
    </a>
    <a href="https://dev.to/genievot/how-to-send-money-on-emails-using-momp-network-57m6" target="_blank" style="text-decoration: none">
    <q-btn icon="info" color="grey-7" flat round>
        <q-tooltip>
          Use stepper to send supported assets to any email on this page.
        </q-tooltip>
      </q-btn>
      </a>

      <a style="text-decoration: none" href="https://github.com/genievot/momp-network-document-/blob/main/Momp%20protocol%20document%2024-SEP-2021.pdf" target="_blank">
       <q-btn icon="article" color="grey-10" flat round>
      </q-btn>
      </a>
      
      <a href="https://discord.gg/grsA7QUZhJ" target="_blank" style="text-decoration: none">
      <q-btn icon="discord" style="color: #7289d9" flat round>
      </q-btn>
      </a>
  </div>
  <div class="q-pa-md row justify-center">
    <q-stepper
      v-model="step"
      ref="stepper"
      class="bg-grey-3"
      active-color="moipl"
      done-color="moipd"
      style="width: 50rem; border-radius: 40px"
      header-nav
      animated
    >
      <q-step
        :name="1"
        title="Sender"
        icon="account_balance_wallet"
        :error="!sender || !asset_name"
        :done="step > 1"
      >
        <FormOne 
        v-model:sender="sender" 
        v-model:asset_name="asset_name" 
        @changeStep="advanceStep"
        :options="asset_options"
        />

      </q-step>

      <q-step
        :name="2"
        title="Recipient"
        icon="person_pin_circle"
        :error="!asset_amount || !receiver_email"
        :done="step > 2"
      >
        <FormTwo 
          @changeStep="advanceStep"
          @sendMoney="send_money"
          v-model:asset_amount="asset_amount" 
          v-model:receiver="receiver_email" 
        />
      </q-step>


    </q-stepper>
  </div>

  <div class="row justify-center">
    <p class="text-h4 text-grey-5"> OR</p>
  </div>
  <div class="row justify-center">
    <q-btn class="bg-grey-9 text-white" rounded label="Verify Email" to="/verify" />
  </div>
  </q-page>
</template>



<script>
import { useQuasar } from 'quasar'
import { ref } from 'vue'
export default ({
  name: 'PageIndex',
  setup () {
    const $q = useQuasar()
    const step = ref(1)

    const asset_name = ref(null)
    const asset_amount = ref(null)
    const receiver_email = ref(null)
    const sender = ref(null)
    const asset_options = ref([
        {
          label: '(AE) Aeternity',
          value: 'ae_aeternity',
          description: 'Native tokens of Aeternity',
          icon: 'img:https://cryptologos.cc/logos/aeternity-ae-logo.svg'
        }])

    return {
      step,
      asset_name,
      asset_amount,
      receiver_email,
      sender,
      asset_options
    }
  },
  methods: {
    advanceStep(variable) {
        this.step = variable
    },
    async send_money() {
      if(!window.$registration_fee || !window.$base_fee) {
        this.$q.notify({
          message: 'Loading Data, Try again in 10-20 seconds...',
          color: 'secondary'
        })
        return
      }
      if(!this.asset_name || !this.asset_amount || !this.sender || !this.receiver_email) {
        this.$q.notify({
            message: 'ri00001: All values required !',
            color: 'pink-10',
            progress: true,
            timeout: 5000
        })
        return
      }

      const encoder = new window.TextEncoder();
      const data = encoder.encode(this.receiver_email.trim().toLowerCase());
      let hashed_email = await window.crypto.subtle.digest('SHA-256', data);
      window.$to_hex_index = window.Array.from(new Uint8Array(hashed_email)).map(b => b.toString(16).padStart(2, '0')).join('')
      

      window.$tx_network = "Aeternity Mainnet"
      window.$tx_sender = this.sender
      window.$tx_amount = this.asset_amount

      this.$q.loading.show({
        message: 'Fetching receiver status !',
        boxClass: 'bg-grey-2 text-grey-9',
        spinnerColor: 'amber-7'
      })
      
      let receiver_verified = null
      try {
          let _receiver_verified = await window.$contract.methods.isVerifiedEmail(window.$to_hex_index)
          receiver_verified = _receiver_verified.decodedResult
      } catch (e) {
          console.log(e)
          receiver_verified = false
          // continue with next code...
      }
      

      try {
        this.$q.loading.show({
          message: 'Fetching payment id !',
          boxClass: 'bg-grey-2 text-grey-9',
          spinnerColor: 'amber-7'
      })
        let _tx_payment_id = await window.$contract.methods.getNextQueryID()
        window.$tx_payment_id = _tx_payment_id.decodedResult
        console.log(window.$tx_payment_id)
      } catch(e) {
        this.$q.notify({
          message: 'bi0002: ' + e.message,
          color: 'pink-10',
          progress: true,
          timeout: 8000
        })
        this.$q.loading.hide()
        return
      }
      this.$q.loading.show({
        message: 'Preparing query data !',
        boxClass: 'bg-grey-2 text-grey-9',
        spinnerColor: 'amber-7'
      })
      let query_data = null
        
      this.$axios({
        method: 'post',
        url: 'https://say-network-encryption-backend-star-genievot.cloud.okteto.net/get_encrypted_query',
        data: {
          text: receiver_verified ? this.sender.trim() + '__' + this.receiver_email.trim().toLowerCase() + '__' + "MOMP transaction" + '__' + this.$tx_mail_verified() : this.sender.trim() + '__' + this.receiver_email.trim().toLowerCase() + '__' + "MOMP transaction" + '__' + this.$tx_mail_unverified()
        }
      }).then(async (response) => {
        console.log(response)
        query_data = response.data
        try {
          this.$q.loading.show({
            message: 'Sending money now !',
            boxClass: 'bg-grey-2 text-grey-9',
            spinnerColor: 'amber-7'
          })
          let __tx_payment_id = await window.$contract.methods.send_money(window.$to_hex_index, query_data.toString(), { amount: (this.asset_amount * 10**18) + window.$base_fee_smtp + window.$base_fee, gasPrice: 2500000000 })

          this.$q.notify({
              message: 'Save your Payment ID: ' + __tx_payment_id.decodedResult,
              color: 'secondary',
              progress: true,
              timeout: 50000
          })
          this.$q.notify({
              message: 'Emails will be delivered soon !',
              color: 'secondary',
              progress: true,
              timeout: 20000
          })
          this.$q.loading.hide()
        } catch (e) {
          console.log(e)
          this.$q.notify({
            message: 'bi0002: ' + e.message,
            color: 'pink-10',
            progress: true,
            timeout: 8000
          })
          this.$q.loading.hide()
        }
        
      }).catch((e) => {
        this.$q.notify({
            message: 'bi0002: ' + e.message,
            color: 'pink-10',
            progress: true,
            timeout: 8000
        })
        this.$q.loading.hide()
      })

      
    }
  },
  mounted () {

  }
})
</script>
