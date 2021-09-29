<template>
  <q-form
      @submit="onSubmit"
      class="q-gutter-md"
    >

      <q-input
        outlined
        rounded
        bg-color="grey-4"
        color="moipl"
        :model-value="receiver"
        @update:modelValue="$emit('update:receiver', $event)"
        label="Receiver Email *"
        hint="Recipient Email"
        lazy-rules
        :rules="[ val => val && val.length > 0 || 'Please type something']"
      />

      <q-input
        outlined
        rounded
        bg-color="grey-4"
        color="moipl"
        type="number"
        step="any"
        min="0"
        :model-value="asset_amount"
        @update:modelValue="$emit('update:asset_amount', $event)"
        label="Enter amount in AE *"
        lazy-rules
        :rules="[
          val => val !== null && val !== '',
          val => val > 0 || 'Please type a real amount in AE.'
        ]"
      />

      <q-input
        outlined
        rounded
        bg-color="grey-3"
        color="moipl"
        :model-value="tx_msg"
        @update:modelValue="$emit('update:tx_msg', $event)"
        label="Enter your message."
      />

        <div>
          <q-btn rounded @click="this.$emit('changeStep', 1)" icon="chevron_left" flat class="q-mr-sm" />
          <q-btn type="submit" rounded color="moipd" icon-right="send" label="Send" />
        </div>
      </q-form>      
      
</template>

<script>
import { ref } from 'vue'
export default {
  props: ['receiver', 'asset_amount', 'tx_msg'],
  emits: ['update:receiver', 'update:asset_amount', 'update:tx_msg', 'changeStep'],

  mounted() {
  },
  methods: {
    onSubmit () {
        this.$emit('sendMoney')
      }
  }
}
</script>
