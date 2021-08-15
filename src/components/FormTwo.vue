<template>
  <q-form
      @submit="onSubmit"
      class="q-gutter-md"
    >
      <q-input
        outlined
        rounded
        v-model="sender_name"
        label="Your name *"
        hint="Name and surname"
        lazy-rules
        :rules="[ val => val && val.length > 0 || 'Please type something']"
      />

      <q-input
        filled
        rounded
        type="number"
        v-model="asset_amount"
        label="Your age *"
        lazy-rules
        :rules="[
          val => val !== null && val !== '' || 'Please type your age',
          val => val > 0 && val < 100 || 'Please type a real age'
        ]"
      />

        <div>
          <q-btn rounded @click="this.$emit('changeStep', 1)" icon="chevron_left" flat class="q-mr-sm" />
          <q-btn type="submit" rounded color="moipd" icon-right="chevron_right" label="Continue" />
        </div>
      </q-form>      
      
</template>

<script>
import { ref } from 'vue'
export default {
  // name: 'ComponentName',
  setup () {
    const asset_name = ref(null)
    const asset_amount = ref(null)
    const sender_name = ref(null)
    return {
      asset_name,
      asset_amount,
      sender_name
    }
  },
  methods: {
    onSubmit () {
        this.$emit('changeStep', 3)
      }
  }
}
</script>
