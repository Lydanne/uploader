import { getCurrentInstance } from "vue-demi";

export function useRouter() {
  return getCurrentInstance()?.proxy.$router 
}