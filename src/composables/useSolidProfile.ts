import { ref } from "vue";

const name = ref("");
const img = ref("");
const inbox = ref("");

export const useSolidProfile = () => {
  return { name, img, inbox };
};
