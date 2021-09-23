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
        :model-value="sender"
        @update:modelValue="$emit('update:sender', $event)"
        label="Your Name/Email *"
        lazy-rules
        :rules="[ val => val && val.length > 0 || 'Please type something']"

      />
      <span class="text-caption">* You will receive copy of sent email if you add your email here.</span>

     <q-select
        rounded
        outlined
        bg-color="grey-4"
        :model-value="asset_name"
        @update:modelValue="$emit('update:asset_name', $event);"
        :options="$attrs.options"
        label="Select Asset"
        color="teal"
        options-selected-class="text-moipl"
        :rules="[ val => val && val.value.length > 0 || 'Please select something']"
      >
      <template v-slot:selected-item="scope">
          <q-icon :name="scope.opt.icon" class="q-pr-sm q-pl-sm" /> {{ scope.opt.label }}
       </template>
        <template v-slot:option="scope">
          <q-item v-bind="scope.itemProps">
            <q-item-section avatar>
              <q-icon :name="scope.opt.icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label v-html="scope.opt.label" />
              <q-item-label caption>{{ scope.opt.description }}</q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </q-select>

        <div>
          <q-btn type="submit" rounded color="moipd" icon-right="chevron_right" label="Continue" />
        </div>
      </q-form>
</template>

<script>
import { ref } from 'vue'
export default {
  props: ['sender', 'asset_name'],
  emits: ['update:sender', 'update:asset_name', 'changeStep'],
  methods: {
    onSubmit () {
        this.$emit('changeStep', 2)
      }
  }
}
</script>
