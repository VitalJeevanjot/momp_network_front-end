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
        type="text"
        :model-value="public_key"
        @update:modelValue="$emit('update:public_key', $event)"
        label="Your Public Key *"
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
  props: ['public_key'],
  emits: ['update:public_key', 'changeStep'],
  methods: {
    onSubmit () {
        this.$emit('changeStep', 2)
      }
  }
}
</script>
