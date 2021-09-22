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
        title="Public Key"
        icon="account_balance_wallet"
        :error="!public_key"
        :done="step > 1"
      >
        
       <FormOne_verify
        v-model:public_key="public_key" 
        @changeStep="advanceStep"
        />
      </q-step>

      <q-step
        :name="2"
        title="Email"
        icon="mail"
        :error="!user_email"
        :done="step > 2"
      >
         <FormTwo_verify
        v-model:user_email="user_email" 
        @changeStep="advanceStep"
        @registerAndAdvanceStep="register_and_advance_step"
        />

      </q-step>

      <q-step
        :name="3"
        title="Confirm"
        icon="send"
      >
        <FormThree_verify
        v-model:otp_original="otp_original" 
        @register_verify="registerUser"
        @changeStep="advanceStep"
        />
      </q-step>
    </q-stepper>
    
  </div>

  <div class="row justify-center">
    <p class="text-h4 text-grey-5"> OR</p>
  </div>
  <div class="row justify-center">
    <q-btn class="bg-grey-3 text-black" rounded label="Send Asset" to="/" />
  </div>
  </q-page>
</template>

<script>
import { useQuasar } from 'quasar'
import { ref } from 'vue'
export default ({
  name: 'PageIndex',
  setup () {
    const step = ref(1)

    const otp_original = ref(null)
    const user_email = ref(null)
    const public_key = ref(null)

    return {
      otp_original,
      user_email,
      public_key,
      step
    }
  },
  methods: {
    advanceStep(variable) {
        this.step = variable
    },
    async register_and_advance_step(variable) {
      
      if(!window.$address) {
        this.$q.notify({
          message: 'Required: Wallet approval',
          color: 'pink-10'
        })
        this.$q.notify({
          message: 'Try Again: Reload page or check wallet extension.',
          color: 'pink-10'
        })
        return
      }

      if(!this.public_key) {
        this.$q.notify({
          message: 'Required: Public key',
          color: 'pink-10'
        })
        return
      }

      if(!window.$registration_fee || !window.$base_fee) {
        this.$q.notify({
          message: 'Loading Data! Try again in 10-20 seconds...',
          color: 'secondary'
        })
        return
      }
      console.log("Registration fee is: " + window.$registration_fee)
      console.log("Base fee is: " + window.$base_fee)


      this.$q.loading.show({
        message: 'Checking existing keys. Do not close this tab.',
        boxClass: 'bg-grey-2 text-grey-9',
        spinnerColor: 'amber-7'
      })

      const encoder = new window.TextEncoder();
      const data = encoder.encode(this.user_email);
      let hashed_email = await window.crypto.subtle.digest('SHA-256', data);
      let to_hex = window.Array.from(new Uint8Array(hashed_email)).map(b => b.toString(16).padStart(2, '0')).join('')


      this.$q.loading.show({
        message: 'Checking account status. Do not close this tab.',
        boxClass: 'bg-grey-2 text-grey-9',
        spinnerColor: 'amber-7'
      })

      try {
        try {
          let _account_status = await window.$contract.methods.clients_new_pub_key(to_hex)
          if(_account_status.decodedResult == this.public_key) {
            this.$q.notify({
              message: 'Next step: Verify your updation.',
              color: 'secondary'
            })
            window.$verify = 'new'
            this.step = variable
          } else {
            this.$q.notify({
              message: 'Check your public address.',
              color: 'warning'
            })
            return
          }
        } catch (e) {
          console.log('registered if')
          console.log(e)
          let account_status = await window.$contract.methods.clients_pub_key(to_hex)
          if(account_status.decodedResult == this.public_key) {
            this.$q.notify({
              message: 'Next step: Verification.',
              color: 'secondary'
            })
            window.$verify = 'new'
            this.step = variable
          } else {
            this.$q.notify({
              message: 'Check your public address.',
              color: 'warning'
            })
            return
          }
        }
      } catch(e) {
        console.log('not registered it...')
        console.log(e)
      }


      this.$q.loading.show({
        message: 'Check registration fee status. Do not close this tab.',
        boxClass: 'bg-grey-2 text-grey-9',
        spinnerColor: 'amber-7'
      })
      
      var fee_status = null
      try {
        fee_status = await window.$contract.methods.get_registration_fee_paid_or_not(to_hex)
      } catch(e) {
        console.log(e)
        this.$q.notify({
          message: '0001: ' + e.message,
          color: 'warning'
        })
        if(e.message == 'Invocation failed: "Maps: Key does not exist"') {
          this.$q.loading.show({
            message: 'Paying registration fee. Do not close this tab.',
            boxClass: 'bg-grey-2 text-grey-9',
            spinnerColor: 'amber-7'
          })
          try {
            let pay_registration_fee = await window.$contract.methods.pay_registration_fee.send(to_hex, { amount: window.$registration_fee })
            console.log(pay_registration_fee.decodedResult)
          } catch (e) {
            console.log(e)
            this.$q.notify({
              message: '0003: ' + e.message,
              color: 'pink-10'
            })
          }
          
          this.$q.loading.show({
            message: 'Check registration fee status again. Do not close this tab.',
            boxClass: 'bg-grey-2 text-grey-9',
            spinnerColor: 'amber-7'
          })
          try {
            fee_status = await window.$contract.methods.get_registration_fee_paid_or_not(to_hex)
            if(fee_status.decodedResult == true) {
              console.log("Fee Now seems to be paid, right ? : ")
              console.log(fee_status.decodedResult)
              this.send_data_to_backend()
            } else {
              this.$q.notify({
              message: 'i003: Registration fee not paid!',
              color: 'pink-10'
            })
            }
          } catch (e) {
            console.log(e)
            this.$q.notify({
              message: '0005: Registration fee not paid!',
              color: 'pink-10'
            })
          }
          console.log("inside if...")
        }
        this.$q.loading.hide()
        return
      }

      console.log("Fee seems to be paid, right ? : ")
      console.log(fee_status.decodedResult)
      this.$q.loading.hide()
      this.send_data_to_backend()
    },
    send_data_to_backend() {
      this.$q.loading.show({
        message: 'Performing email registration. Do not close this tab.',
        boxClass: 'bg-grey-2 text-grey-9',
        spinnerColor: 'amber-7'
      })
      this.$axios({
        method: 'post',
        url: 'http://localhost:8081/register',
        data: {
          user_email: this.user_email,
          public_key: this.public_key
        }
      }).then((response) => {
        // handle success
        console.log(response);
        this.$q.loading.hide()
      })
      .catch((error) => {
        // handle error
        console.log(error);
        this.$q.notify({
              message: 'b0001: ' + error.message,
              color: 'pink-10'
        })
        this.$q.loading.hide()
      })
    },
    verify_user() {
      
    },
  },
  mounted () {

  }
})
</script>
