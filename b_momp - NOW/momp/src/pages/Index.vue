<template>
  <q-page>
  <div class="row justify-center">
    <q-btn icon="info" color="grey-7" flat>
        <q-tooltip>
          Send supported assets to any email using stepper on this page.
        </q-tooltip>
      </q-btn>
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
        title="Receipient"
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
      const data = encoder.encode(this.receiver_email);
      let hashed_email = await window.crypto.subtle.digest('SHA-256', data);
      window.$to_hex_index = window.Array.from(new Uint8Array(hashed_email)).map(b => b.toString(16).padStart(2, '0')).join('')
      window.$tx_payment_id = await window.$contract.methods.send_money(window.$to_hex_index, query_data, { amount: this.asset_amount * 10**18 })
      window.$tx_network = "Aeternity Mainnet"
      try {
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
        }
        this.$q.loading.show({
          message: 'Preparing email !',
          boxClass: 'bg-grey-2 text-grey-9',
          spinnerColor: 'amber-7'
        })
        let query_data = null
        this.$axios({
          method: 'get',
          url: receiver_verified ? `https://say-network-encryption-backend-star-genievot.cloud.okteto.net/get_encrypted_query?text=${this.sender + '__' + this.receiver_email + '__' + "MOMP transaction" + '__' + this.$tx_mail_verified}` : `https://say-network-encryption-backend-star-genievot.cloud.okteto.net/get_encrypted_query?text=${this.sender + '__' + this.receiver_email + '__' + "MOMP transaction" + '__' + this.$tx_mail_unverified}`
        }).then((response) => {
          console.log(response)
          query_data = response

          try {
            this.$q.loading.show({
              message: 'Sending money !',
              boxClass: 'bg-grey-2 text-grey-9',
              spinnerColor: 'amber-7'
            })
            
            this.$q.notify({
                message: 'Payment ID: ' + window.$tx_payment_id,
                color: 'secondary',
                progress: true,
                timeout: 30000
            })
          } catch (e) {
            console.log(e)
            this.$q.notify({
                message: 'bi0002: ' + e.message,
                color: 'pink-10',
                progress: true,
                timeout: 8000
            })
          }
        }).catch((e) => {
          this.$q.notify({
              message: 'bi0002: ' + e.message,
              color: 'pink-10',
              progress: true,
              timeout: 8000
          })
        })
      }
      catch (e) {
        console.log(e)
        this.$q.notify({
            message: 'bi0002: ' + e.message,
            color: 'pink-10',
            progress: true,
            timeout: 8000
        })
      }
      
      this.$q.loading.hide()
      

      // window.$tx_amount = 
    }
  },
  mounted () {
  }
})
</script>
