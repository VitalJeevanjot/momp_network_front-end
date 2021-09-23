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
        :model-value="user_email"
        @update:modelValue="$emit('update:user_email', $event)"
        label="Your Email for verification*"
        lazy-rules
        :rules="[ val => val && val.length > 0 || 'Please type something']"
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
  props: ['user_email'],
  emits: ['update:user_email', 'changeStep', 'registerAndAdvanceStep'],

  mounted() {
  },
  methods: {
    onSubmit () {
        this.$emit('registerAndAdvanceStep', 3)
      }
  }
}
</script>
