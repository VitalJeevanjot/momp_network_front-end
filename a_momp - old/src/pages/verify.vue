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
        :error="user_email==''"
        :done="step > 2"
      >
         <FormTwo_verify
        v-model:user_email="user_email" 
        @changeStep="advanceStep"
        />

      </q-step>

      <q-step
        :name="3"
        title="Confirm"
        icon="send"
      >
        Try out different ad text to see what brings in the most customers, and learn how to
        enhance your ads using features like ad extensions. If you run into any problems with
        your ads, find out how to tell if they're running and how to resolve approval issues.
      <div>
          <q-btn v-if="step > 1" rounded @click="$refs.stepper.previous()" icon="chevron_left" flat class="q-mr-sm" />
      </div>
      </q-step>
    </q-stepper>
    
  </div>

  <div class="row justify-center">
    <p class="text-h4 text-grey-5"> OR</p>
  </div>
  <div class="row justify-center">
    <q-btn class="bg-grey-3 text-black" rounded label="Transmit" to="/" />
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

    const user_email = ref(null)
    const public_key = ref(null)

    return {
      user_email,
      public_key,
      step
    }
  },
  methods: {
    advanceStep(variable) {
        this.step = variable
    },
  },
  mounted () {
  }
})
</script>
