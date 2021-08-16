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
      style="width: 50rem"
      header-nav
      animated
    >
      <q-step
        :name="1"
        title="Receiver"
        icon="settings"
        :error="receiver_email == null || sender_email == null"
        :done="step > 1"
      >
        <FormOne v-model:receiver="receiver_email" v-model:sender="sender_email" @changeStep="advanceStep"/>

      </q-step>

      <q-step
        :name="2"
        title=""
        icon="create_new_folder"
        :done="step > 2"
      >
        <FormTwo @changeStep="advanceStep"/>
      </q-step>

      <q-step
        :name="3"
        title="Create an ad"
        icon="add_comment"
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
    const sender_email = ref(null)
    const sender_name = ref(null)

    return {
      step,
      asset_name,
      asset_amount,
      receiver_email,
      sender_email,
      sender_name,
    }
  },
  methods: {
    advanceStep(variable) {
        this.step = variable
    },
    showReceiver(variable) {
        console.log(variable)
    }
  }
})
</script>
