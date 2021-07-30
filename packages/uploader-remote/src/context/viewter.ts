import { InjectionKey, Ref } from "vue-demi";

export type View = "home" | "upload";

export interface Viewter {
  view: Ref<View>;
  to(view: View): void;
}

export const viewterKey: InjectionKey<Viewter> = Symbol();
