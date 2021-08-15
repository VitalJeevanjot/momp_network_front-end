import { boot } from 'quasar/wrappers'

import FormOne from 'components/FormOne.vue'
import FormTwo from 'components/FormTwo.vue'
// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async ({ app }) => {
  app.component('FormOne', FormOne)
  app.component('FormTwo', FormTwo)
})
