/**
 * character controller
 */

import { factories } from "@strapi/strapi";
import { parseCharacterQuery } from "../lib/utils";

export default factories.createCoreController(
  "api::character.character",
  ({ strapi }) => ({
    async find(ctx) {
      const baseUrl = `${ctx.protocol}://${ctx.host}`;

      const { filters, pagination } = parseCharacterQuery(ctx.query);

      let finalLimit = pagination.limit;
      if (finalLimit === undefined) {
        finalLimit = await strapi
          .documents("api::character.character")
          .count({ status: "published", filters });
      }

      return await strapi
        .service("api::character.character")
        .getShapedCharacters(
          { filters, pagination: { ...pagination, limit: finalLimit } },
          baseUrl,
        );
    },
    async findOne(ctx) {
      const { id } = ctx.params;
      const baseUrl = `${ctx.protocol}://${ctx.host}`;

      const result = await strapi
        .service("api::character.character")
        .getShapedCharacter(id, baseUrl);

      if (!result) {
        return ctx.notFound("Character not found");
      }

      return result;
    },
    async random(ctx) {
      const baseUrl = `${ctx.protocol}://${ctx.host}`;

      const { filters, pagination } = parseCharacterQuery(ctx.query);

      const finalLimit = pagination.limit ?? 1;

      const count = await strapi
        .documents("api::character.character")
        .count({ status: "published", filters });

      if (count === 0) {
        return ctx.notFound("No characters found");
      }

      const maxStart = Math.max(count - finalLimit, 0);
      const randomStart = Math.floor(Math.random() * (maxStart + 1));
      const start = Math.min(randomStart + pagination.start, maxStart);

      const results = await strapi
        .service("api::character.character")
        .getShapedCharacters(
          { pagination: { start, limit: finalLimit } },
          baseUrl,
        );

      if (results.length === 0) {
        return ctx.notFound("Character not found");
      }

      return finalLimit === 1 ? results[0] : results;
    },
  }),
);
