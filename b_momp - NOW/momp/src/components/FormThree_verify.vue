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
        :model-value="otp_original"
        @update:modelValue="$emit('update:otp_original', $event)"
        label="Your OTP *"
        lazy-rules
        :rules="[ val => val && val.length > 0 || 'Please type something']"
      />
      <div>
         <p class="text-caption text-grey-7">* OTP is sent to your email. It is will be valid forever (only for this email & public key). You can always verify your account later. Please fill the otp here. Join our communication network to learn more about this protocol.*         
        </p>
      </div>

        <div>
          <q-btn rounded @click="this.$emit('changeStep', 1)" icon="chevron_left" flat class="q-mr-sm" />
          <q-btn type="submit" rounded color="moipd" icon-right="done" label="Register" />
        </div>
      </q-form>      
      
</template>

<script>
import { ref } from 'vue'
export default {
  props: ['otp_original'],
  emits: ['update:otp_original', 'changeStep', 'register_verify'],

  mounted() {

  },
  methods: {
    onSubmit () {
        this.$emit('register_verify')
      }
  }
}
</script>
