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
        type="text"
        :model-value="sender"
        @update:modelValue="$emit('update:sender', $event)"
        label="Sender *"
        lazy-rules
        :rules="[ val => val && val.length > 0 || 'Please type something']"

      />

        <div>
          <q-btn type="submit" rounded color="moipd" icon-right="chevron_right" label="Continue" />
        </div>
      </q-form>
</template>

<script>
import { ref } from 'vue'
export default {
  props: ['receiver', 'sender'],
  emits: ['update:receiver', 'update:sender', 'changeStep'],
  methods: {
    onSubmit () {
        this.$emit('changeStep', 2)
      }
  }
}
</script>
