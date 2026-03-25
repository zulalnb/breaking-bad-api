/**
 * quote controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::quote.quote",
  ({ strapi }) => ({
    async find() {
      const count = await strapi
        .documents("api::quote.quote")
        .count({ status: "published" });

      const { results } = await strapi.service("api::quote.quote").find({
        fields: ["quote"],
        populate: {
          author: { fields: ["name"] },
          series: { fields: ["name"] },
        },
        pagination: {
          limit: count,
        },
      });

      const shaped = results.map((quote) => ({
        quote_id: quote.documentId,
        quote: quote.quote,
        author: quote.author.name,
        series: quote.series.name,
      }));

      return shaped;
    },
    async findOne(ctx) {
      const quote = await strapi.documents("api::quote.quote").findOne({
        documentId: ctx.params.id,
        status: "published",
        fields: ["quote"],
        populate: {
          author: { fields: ["name"] },
          series: { fields: ["name"] },
        },
      });

      if (!quote) {
        return ctx.notFound();
      }

      return {
        quote_id: quote.documentId,
        quote: quote.quote,
        author: quote.author.name,
        series: quote.series.name,
      };
    },
  }),
);
