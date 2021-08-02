import { InjectionKey, Ref } from "vue-demi";

export type View = "home" | "uploadv1" | "uploadv2";

export interface Viewter<T> {
  view: Ref<View>;
  params: T;
  to(view: View, params?: T): void;
}

export const viewterKey: InjectionKey<Viewter<any>> = Symbol();
