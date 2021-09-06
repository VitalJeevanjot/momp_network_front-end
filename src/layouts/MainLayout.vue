<template>
  <q-layout view="lHh Lpr lFf" class="bg-brown-1">

    <q-page-container>
      <div class="row justify-center">
      <img
      alt="Quasar logo"
      src="~assets/logo.svg"
      style="width: 15rem; height: 15rem"
    >
    </div>
      <router-view />
    </q-page-container>
  </q-layout>
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
export default ({
  name: 'MainLayout',

  components: {
  },

  setup () {

  }
})
</script>
