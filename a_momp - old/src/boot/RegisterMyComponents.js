import { boot } from 'quasar/wrappers'

import FormOne from 'components/FormOne.vue'
import FormTwo from 'components/FormTwo.vue'
import FormOne_verify from 'components/FormOne_verify.vue'
import FormTwo_verify from 'components/FormTwo_verify.vue'
// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async ({ app }) => {
  app.component('FormOne', FormOne)
  app.component('FormTwo', FormTwo)
  app.component('FormOne_verify', FormOne_verify)
  app.component('FormTwo_verify', FormTwo_verify)
})
