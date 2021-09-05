<template>
  <q-page>
    <div class="row justify-center">
      <img
      alt="Quasar logo"
      src="~assets/logo.svg"
      style="width: 15rem; height: 15rem"
    >
    </div>
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
          v-model:asset_amount="asset_amount" 
          v-model:receiver="receiver_email" 
        />
        <pre>{{assetName}}</pre>
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
    <q-btn class="bg-grey-9 text-white" rounded label="Verify Email" />
  </div>
  </q-page>
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
    showReceiver(variable) {
        console.log(variable)
    }
  },
  mounted () {
    // this.asset_name.value = "ae_aeternity"
  }
})
</script>
