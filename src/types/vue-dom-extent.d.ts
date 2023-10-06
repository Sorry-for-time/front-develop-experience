export {};

declare module "vue" {
  interface ComponentCustomOptions {}

  interface ComponentOptions<V extends Vue> {}
}
