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
        v-model="receiver_email"
        label="Your name *"
        hint="Name and surname"
        lazy-rules
        :rules="[ val => val && val.length > 0 || 'Please type something']"
      />

      <q-input
        outlined
        rounded
        bg-color="grey-4"
        color="moipl"
        type="number"
        v-model="sender_email"
        label="Your age *"
        lazy-rules
        :rules="[
          val => val !== null && val !== '' || 'Please type your age',
          val => val > 0 && val < 100 || 'Please type a real age'
        ]"
      />

        <div>
          <q-btn type="submit" rounded color="moipd" icon-right="chevron_right" label="Continue" />
        </div>
      </q-form>
</template>

<script>
import { ref } from 'vue'
export default {
  // name: 'ComponentName',
  setup () {
    const receiver_email = ref(null)
    const sender_email = ref(null)

    return {
      receiver_email,
      sender_email
    }
  },
  methods: {
    onSubmit () {
        this.$emit('eventname', 2)
      }
  }
}
</script>
