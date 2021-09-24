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
        @changeStep="advanceStep"
        @verifyUser="verify_user"
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
          message: 'Loading Data, Try again in 10-20 seconds...',
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
      window.$to_hex = window.Array.from(new Uint8Array(hashed_email)).map(b => b.toString(16).padStart(2, '0')).join('')


      this.$q.loading.show({
        message: 'Checking account status. Do not close this tab .',
        boxClass: 'bg-grey-2 text-grey-9',
        spinnerColor: 'amber-7'
      })

      try {
        try {
          let _account_status = await window.$contract.methods.clients_new_pub_key(window.$to_hex)
          if(_account_status.decodedResult == this.public_key) {
            this.$q.loading.show({
              message: 'Checking verification status. Do not close this tab .',
              boxClass: 'bg-grey-2 text-grey-9',
              spinnerColor: 'amber-7'
            })
            let _verification_status = await window.$contract.methods.isEditedVerifiedEmail(window.$to_hex)
            if(_verification_status.decodedResult == false) {
              this.$q.notify({
                progress: true,
                message: 'Next step: Verify your new public key .',
                color: 'secondary',
                timeout: 8000
              })
              window.$verify = 'update'
              this.step = variable
              this.$q.loading.hide()
            } else if (_verification_status.decodedResult == true) {
              this.$q.notify({
                message: 'Already verified ! Checking for remaining balance .',
                color: 'secondary',
                timeout: 8000
              })
              this.withdraw_amount()
            }
            return
          } else {
            window.$verify = 'update'
            console.log("Public key from smart contract: " + _account_status.decodedResult )
            this.$q.notify({
              progress: true,
              message: 'Updating your new public address in the smart contract.',
              color: 'secondary',
              timeout: 15000
            })
          }
         
        } catch (e) {
          console.log('registered if')
          console.log(e)
          let account_status = await window.$contract.methods.clients_pub_key(window.$to_hex)
          if(account_status.decodedResult == this.public_key) {
            this.$q.loading.show({
              message: 'Checking verification status. Do not close this tab .',
              boxClass: 'bg-grey-2 text-grey-9',
              spinnerColor: 'amber-7'
            })
            let verification_status = await window.$contract.methods.isEditedVerifiedEmail(window.$to_hex)
            if(verification_status.decodedResult == false) {
              this.$q.notify({
                progress: true,
                message: 'Next step: Verification.',
                color: 'secondary',
                timeout: 7000
              })
              this.step = variable
  
              window.$verify = 'first'
              this.$q.loading.hide()
            } else if(verification_status.decodedResult == true) {

              this.$q.notify({
                message: 'Already verified Details ! Checking for remaining balance .',
                color: 'secondary',
                timeout: 7000
              })
              this.withdraw_amount()
            }
            return
          } else {
            this.$q.notify({
              progress: true,
              message: 'Updating your new public address in the smart contract.',
              color: 'secondary',
              timeout: 15000
            })
            window.$verify = 'update'
          }
          
        }
      } catch(e) {
        console.log('not registered it...')
        window.$verify = 'first'
        console.log(e)
      }


      this.$q.loading.show({
        message: 'Check registration fee status. Do not close this tab.',
        boxClass: 'bg-grey-2 text-grey-9',
        spinnerColor: 'amber-7'
      })
      
      var fee_status = null
      try {
        fee_status = await window.$contract.methods.get_registration_fee_paid_or_not(window.$to_hex)
        if(fee_status.decodedResult == false) {
          throw new Error('Fee not paid!');
        }
      } catch(e) {
        console.log(e)
        this.$q.notify({
          message: '0001: Paying registration fee',
          color: 'warning'
        })
        if(e.message == 'Invocation failed: "Maps: Key does not exist"' || e.message == 'Fee not paid!') {
          this.$q.loading.show({
            message: 'Paying registration fee. Do not close this tab.',
            boxClass: 'bg-grey-2 text-grey-9',
            spinnerColor: 'amber-7'
          })
          try {
            let pay_registration_fee = await window.$contract.methods.pay_registration_fee.send(window.$to_hex, { amount: window.$registration_fee, gasPrice: 7500000000 })
            console.log(pay_registration_fee.decodedResult)
          } catch (e) {
            console.log(e)
            this.$q.notify({
              message: '0003: ' + e.message,
              color: 'pink-10',
              progress: true,
              timeout: 10000
            })
            this.$q.loading.hide()
            return
          }
          
          this.$q.loading.show({
            message: 'Check registration fee status again. Do not close this tab.',
            boxClass: 'bg-grey-2 text-grey-9',
            spinnerColor: 'amber-7'
          })
          try {
            fee_status = await window.$contract.methods.get_registration_fee_paid_or_not(window.$to_hex)
            if(fee_status.decodedResult == true) {
              console.log("Fee Now seems to be paid, right ? : ")
              console.log(fee_status.decodedResult)
              this.send_data_to_backend()
            } else {
              this.$q.notify({
              message: 'i003: Registration fee not paid !',
              color: 'pink-10'
            })
            this.$q.loading.hide()
            return
            }
          } catch (e) {
            console.log(e)
            this.$q.notify({
              message: '0005: Registration fee not paid !',
              color: 'pink-10'
            })
            this.$q.loading.hide()
            return
          }
          console.log("inside if...")
        }
        this.$q.loading.hide()
        this.send_data_to_backend()
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
        if(response.data.split(':')[0] == 'ok') {
          this.step = 3
            this.$q.notify({
              progress: true,
              message: 'Successfully Registered !',
              color: 'amber-7',
              timeout: 30000
            })
            this.$q.notify({
              progress: true,
              message: 'The OTP is sent ! It is only allowed once per addition .',
              color: 'secondary',
              timeout: 25000
            })

        } else {
          this.$q.notify({
            message: response.data,
            color: 'pink-10'
          })
        }
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
    async verify_user() {
      // try {
      //   console.log("verify OTP")
      //   console.log(window.$to_hex, this.otp_original)
      //   let verification_test = await window.$contract.methods.test_otp_creation(window.$to_hex, this.otp_original)
      //   console.log(verification_test.decodedResult)
      // } catch (e) {
      //   console.log(e)
      // }
      if(!this.user_email || !window.$to_hex) {
        this.$q.notify({
          progress: true,
          message: 'Required Email & Public key, Add it on previous step (Require step by step execution).',
          color: 'pink-10',
          timeout: 7000
        })
      }
      this.$q.loading.show({
        message: 'Verification is in process ! Do not close this tab .',
        boxClass: 'bg-grey-2 text-grey-9',
        spinnerColor: 'amber-7'
      })
      let verification_status = null
      try {
        console.log(window.$verify)
        if(window.$verify == 'update') {
          console.log("2nd Time verification!")
          verification_status = await window.$contract.methods.verify_and_edit_email_with_otp(window.$to_hex, this.otp_original, {gasPrice: 2500000000})
        }
        else if(window.$verify == 'first') {
          console.log("First Time verification!")
          verification_status = await window.$contract.methods.verify_otp(window.$to_hex, this.otp_original, {gasPrice: 2500000000})
        }

        console.log("Verification status! : " + verification_status.decodedResult)
        this.$q.notify({
          progress: true,
          message: 'Verification status: ' + verification_status.decodedResult,
          color: 'amber-7',
          timeout: 35000
        })
        if(verification_status.decodedResult == true && window.$verify == 'first') {
          this.withdraw_amount()
        }
        
      } catch (e) {
        console.log(e)
        if(e.message == "Cannot read properties of null (reading 'decodedResult')") {
          this.$q.notify({
            message: 'v00098: Required all fields and step by step execution !',
            color: 'pink-10',
            progress: true,
            timeout: 7000
          })
        } else {
          this.$q.notify({
            message: 'v00099: ' + e.message,
            color: 'pink-10',
            progress: true,
            timeout: 10000
          })
        }
      }
      this.$q.loading.hide()
      return
    },
    async withdraw_amount() {
      this.$q.loading.show({
        message: 'Checking any remaining amount in the contract. Do not close this tab .',
        boxClass: 'bg-grey-2 text-grey-9',
        spinnerColor: 'amber-7'
      })

      try {

        let available_balance = await window.$contract.methods.clients_balance(window.$to_hex)
        if(available_balance.decodedResult > 0) {
          this.$q.notify({
            message: 'Balance: ' + available_balance.decodedResult,
            color: 'amber-7',
            progress: true,
            timeout: 6000
          })
          this.$q.loading.show({
            message: 'Withdrawal to your verified public key, Balance: ' + available_balance.decodedResult,
            boxClass: 'bg-grey-2 text-grey-9',
            spinnerColor: 'amber-7'
          })
          try {
            let withdrawal_status = await window.$contract.methods.clients_balance(window.$to_hex)
            if(withdrawal_status.decodedResult == 0) {
              this.$q.notify({
                message: 'Withdrawal successful of all remaining balance !',
                color: 'secondary',
                progress: true,
                timeout: 25000
              })
            } else {
                console.log("Withdrawal status: " + withdrawal_status.decodedResult)
                this.$q.notify({
                message: 'rb00010: Unknown status!',
                color: 'pink-10',
                progress: true,
                timeout: 10000
              })
            }
          } catch (e) {
            console.log(e)
            this.$q.notify({
              message: 'rb00005: ' + e.message,
              color: 'pink-10',
              progress: true,
              timeout: 10000
            })
          }
        } else {
          this.$q.notify({
            message: 'No amount to withdraw !',
            color: 'amber-7',
            progress: true,
            timeout: 6000
          })
          this.$q.loading.hide()
        }
      } catch (e) {
        console.log(e)
        if(e.message == 'Invocation failed: "Maps: Key does not exist"') {
          this.$q.notify({
            message: 'rb00001: No remaining balance !',
            color: 'amber-7',
            progress: true,
            timeout: 10000
          })
        } else {
          this.$q.notify({
            message: 'rb00002: ' + e.message,
            color: 'pink-10',
            progress: true,
            timeout: 10000
          })
        }
        this.$q.loading.hide()
      }



    }
    
  },
  mounted () {

  }
})
</script>
