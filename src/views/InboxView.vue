<template>
  <div class="grid">
    <div class="col lg:col-6 lg:col-offset-3">
      <Inbox v-if="isLoggedIn" />
    </div>
  </div>
  <router-link to="/">
    <SpeedDial showIcon="pi pi-pencil" />
  </router-link>
</template>

<script lang="ts">
import Inbox from "@/components/inbox/Inbox.vue";
import { useSolidSession } from "@/composables/useSolidSession";

import { defineComponent, toRefs } from "vue";

export default defineComponent({
  name: "InboxView",
  components: { Inbox },
  setup() {
    const { sessionInfo } = useSolidSession();
    const { isLoggedIn } = toRefs(sessionInfo);
    return { isLoggedIn };
  },
});
</script>

<style lang="scss" scoped>
.grid {
  margin: 5px;
}
::v-deep() {
  .p-speeddial {
    bottom: 0;
    right: calc(50% - 2rem);
    padding-bottom: 15px;
  }
}
</style>