<template>
  <div class="grid">
    <div class="col lg:col-6 lg:col-offset-3">
      <div class="p-inputgroup">
        <InputText
          placeholder="A URI to do actions on."
          v-model="uri"
          @keyup.enter="fetch"
        />
        <Button @click="fetch"> GET </Button>
      </div>
      <div class="progressbarWrapper">
        <ProgressBar v-if="isLoading" mode="indeterminate" />
      </div>
    </div>
  </div>
  <div class="grid">
    <div class="col lg:col-6 lg:col-offset-3">
      <Textarea v-model="content" class="sizing" />
    </div>
  </div>
  <div class="grid">
    <div class="col lg:col-6 lg:col-offset-3">
      <SpeedDial
        :model="speedDialActions"
        type="semi-circle"
        :radius="75"
        showIcon="pi pi-ellipsis-h"
        :tooltipOptions="{ position: 'top' }"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { useToast } from "primevue/usetoast";
import { useSolidSession } from "@/composables/useSolidSession";
import {
  getResource,
  parseToN3,
  putResource,
  deleteResource,
  createResource,
} from "@/lib/solidRequests";
import { computed, defineComponent, ref, watch } from "vue";
import { useSolidProfile } from "@/composables/useSolidProfile";

export default defineComponent({
  name: "Scribe",
  components: {},
  setup(props, context) {
    const toast = useToast();
    const { authFetch } = useSolidSession();
    const { inbox } = useSolidProfile();
    const isLoading = ref(false);
    // uri of the information resource
    const uri = ref("");
    watch(
      () => inbox.value,
      () => (uri.value = inbox.value),
      { immediate: true }
    );
    const isHTTP = computed(
      () => uri.value.startsWith("http://") || uri.value.startsWith("https://")
    );
    // content of the information resource
    const content = ref("");
    watch(
      () => inbox.value,
      () => (content.value = inbox.value !== "" ? "<#this> a <#demo>." : ""),
      { immediate: true }
    );
    // get content of information resource
    const fetch = async () => {
      if (!isHTTP.value) {
        return;
      }
      isLoading.value = true;
      const txt = await getResource(uri.value, authFetch.value)
        .catch((err) => {
          toast.add({
            severity: "error",
            summary: "Error on fetch!",
            detail: err,
            life: 5000,
          });
          isLoading.value = false;
          throw new Error(err);
        })
        .then((resp) => resp.text());
      //   const parsedN3 =
      await parseToN3(txt, uri.value)
        .catch((err) => {
          toast.add({
            severity: "error",
            summary: "Parsing Error!",
            detail: err,
            life: 5000,
          });
          //   throw new Error(err);
        })
        .finally(() => {
          content.value = txt;
          isLoading.value = false;
        });
    };

    // Speeddial
    const speedDialActions = [
      // {
      //   label: "PUT Resource",
      //   icon: "pi pi-save",
      //   tooltipOptions: "left",
      //   command: async () => {
      //     if (!isHTTP.value) {
      //       toast.add({
      //         severity: "error",
      //         summary: "Missing URI to save at!",
      //         detail: "Specify a HTTP-URI in the search bar.",
      //         life: 5000,
      //       });
      //       return;
      //     }
      //     putResource(uri.value, content.value, authFetch.value)
      //       .then(() =>
      //         toast.add({
      //           severity: "success",
      //           summary: "Successful Save!",
      //           detail: "The resource has been put at the URI.",
      //           life: 5000,
      //         })
      //       )
      //       .catch((err) =>
      //         toast.add({
      //           severity: "error",
      //           summary: "Error on save!",
      //           detail: err,
      //           life: 5000,
      //         })
      //       );
      //   },
      // },
      {
        label: "POST to Container",
        icon: "pi pi-envelope",
        tooltipOptions: "left",
        command: async () => {
          if (!isHTTP.value) {
            toast.add({
              severity: "error",
              summary: "Missing URI to save at!",
              detail: "Specify a HTTP-URI in the search bar.",
              life: 5000,
            });
            return;
          }
          createResource(uri.value, content.value, authFetch.value)
            .then(() =>
              toast.add({
                severity: "success",
                summary: "Successful Save!",
                detail: "The resource has been posted to the container URI.",
                life: 5000,
              })
            )
            .catch((err) =>
              toast.add({
                severity: "error",
                summary: "Error on save!",
                detail: err,
                life: 5000,
              })
            );
        },
      },
      {
        label: "Check Syntax",
        icon: "pi pi-code",
        command: () => {
          parseToN3(content.value, uri.value)
            .catch((err) => {
              toast.add({
                severity: "error",
                summary: "Error while parsing!",
                detail: err,
                life: 5000,
              });
              throw new Error(err);
            })
            .then(() =>
              toast.add({
                severity: "success",
                summary: "Correct Syntax.",
                detail: "Good job!",
                life: 5000,
              })
            );
        },
      },
      // {
      //   label: "Delete Resource",
      //   icon: "pi pi-trash",
      //   command: () => {
      //     if (!isHTTP.value) {
      //       toast.add({
      //         severity: "error",
      //         summary: "Missing URI to delete!",
      //         detail: "Specify a HTTP-URI in the search bar.",
      //         life: 5000,
      //       });
      //       return;
      //     }
      //     deleteResource(uri.value, authFetch.value)
      //       .then(() =>
      //         toast.add({
      //           severity: "warn",
      //           summary: "Successful Delete!",
      //           detail: "The resource has been deleted.",
      //           life: 5000,
      //         })
      //       )
      //       .catch((err) =>
      //         toast.add({
      //           severity: "error",
      //           summary: "Error on delete!",
      //           detail: err,
      //           life: 5000,
      //         })
      //       );
      //   },
      // },
    ];
    return {
      uri,
      fetch,
      content,
      speedDialActions,
      isLoading,
    };
  },
});
</script>

<style lang="scss" scoped>
.grid {
  margin: 5px;
}
.p-inputgroup {
  padding-bottom: 0px;
}
.border {
  border: 1px solid var(--surface-d);
  border-radius: 3px;
}
.border:hover {
  border: 1px solid var(--primary-color);
}

.progressbarWrapper {
  height: 2px;
  padding: 0px 9px 0px 9px;
  transform: translate(0, -1px);
}
.p-progressbar {
  height: 2px;
  padding-top: 0px;
  border-top-right-radius: 0;
  border-top-left-radius: 0;
}
::v-deep() {
  .p-speeddial {
    bottom: 0;
    right: calc(50% - 2rem);
    padding-bottom: 15px;
    -webkit-tap-highlight-color: transparent;
  }
  .sizing {
    height: calc(100vh - 240px);
    width: 100%;
    max-height: calc(100vh - 240px);
    max-width: 100%;
  }
}
</style>