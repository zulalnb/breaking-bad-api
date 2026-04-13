export default {
  routes: [
    {
      method: "GET",
      path: "/characters/random",
      handler: "api::character.character.random",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
