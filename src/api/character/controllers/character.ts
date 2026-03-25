/**
 * character controller
 */

import { factories } from "@strapi/strapi";

type CharacterStatus = "Alive" | "Presumed dead" | "Deceased" | "Unknown";

type CharacterRaw = {
  id: number;
  documentId: string;
  name: string;
  nickname: string | null;
  birthday: string | null;
  characterStatus: CharacterStatus;
  category: {
    id: number;
    documentId: string;
    name: string;
  }[];
  appearance: {
    id: number;
    documentId: string;
    number: number;
  }[];
  better_call_saul_appearance: {
    id: number;
    documentId: string;
    number: number;
  }[];
  portrayed: {
    id: number;
    documentId: string;
    name: string;
  } | null;
  occupation: {
    id: number;
    value: string;
  }[];
  img: { id: number; documentId: string; url: string } | null;
};

function parseCharacterQuery(query: unknown) {
  if (!query || typeof query !== "object") return {};

  const q = query as Record<string, unknown>;

  const name =
    typeof q.name === "string" && q.name.trim() ? q.name.trim() : undefined;

  const category =
    typeof q.category === "string" && q.category.trim()
      ? q.category.trim()
      : undefined;

  const limit =
    typeof q.limit === "string" && !isNaN(Number(q.limit))
      ? Number(q.limit)
      : undefined;

  const offset =
    typeof q.offset === "string" && !isNaN(Number(q.offset))
      ? Number(q.offset)
      : undefined;

  return { name, category, limit, offset };
}

function buildCharacterFilters(parsed: { name?: string; category?: string }) {
  return {
    ...(parsed.name && { name: { $contains: parsed.name } }),
    ...(parsed.category && {
      category: { name: { $eq: parsed.category } },
    }),
  };
}

export default factories.createCoreController(
  "api::character.character",
  ({ strapi }) => ({
    async find(ctx) {
      const base_url = `${ctx.protocol}://${ctx.host}`;

      const parsed = parseCharacterQuery(ctx.query);
      const filters = buildCharacterFilters(parsed);

      const count = await strapi
        .documents("api::character.character")
        .count({ status: "published", filters });

      const { results } = await strapi
        .service("api::character.character")
        .find({
          filters,
          fields: ["name", "birthday", "nickname", "characterStatus"],
          populate: {
            category: {
              fields: ["name"],
            },
            appearance: {
              fields: ["number"],
            },
            better_call_saul_appearance: {
              fields: ["number"],
            },
            portrayed: { fields: ["name"] },
            occupation: true,
            img: { fields: ["url"] },
          },
          pagination: {
            limit: parsed.limit ?? count,
            start: parsed.offset ?? 0,
          },
        });

      const shaped = results.map((char: CharacterRaw) => ({
        char_id: char.documentId,
        name: char.name,
        birthday: char.birthday ?? "Unknown",
        occupation: char.occupation.map((occ) => occ.value),
        img: char.img
          ? `${base_url}${char.img.url}`
          : `${base_url}/uploads/placeholder_image_blue_landscape_455db0de45.png`,
        status: char.characterStatus,
        nickname: char.nickname ?? "Unknown",
        appearance: char.appearance.map((season) => season.number),
        portrayed: char.portrayed?.name ?? "Unknown",
        category: char.category.map((cat) => cat.name),
        better_call_saul_appearance: char.better_call_saul_appearance.map(
          (season) => season.number,
        ),
      }));

      return shaped;
    },
    async findOne(ctx) {
      const base_url = `${ctx.protocol}://${ctx.host}`;

      const character = await strapi
        .documents("api::character.character")
        .findOne({
          documentId: ctx.params.id,
          status: "published",
          fields: ["name", "birthday", "nickname", "characterStatus"],
          populate: {
            category: {
              fields: ["name"],
            },
            appearance: {
              fields: ["number"],
            },
            better_call_saul_appearance: {
              fields: ["number"],
            },
            portrayed: { fields: ["name"] },
            occupation: true,
            img: { fields: ["url"] },
          },
        });

      if (!character) {
        return ctx.notFound();
      }

      return {
        char_id: character.documentId,
        name: character.name,
        birthday: character.birthday ?? "Unknown",
        occupation: character.occupation.map((occ) => occ.value),
        img: character.img
          ? `${base_url}${character.img.url}`
          : `${base_url}/uploads/placeholder_image_blue_landscape_455db0de45.png`,
        status: character.characterStatus,
        nickname: character.nickname ?? "Unknown",
        appearance: character.appearance.map((season) => season.number),
        portrayed: character.portrayed?.name ?? "Unknown",
        category: character.category.map((cat) => cat.name),
        better_call_saul_appearance: character.better_call_saul_appearance.map(
          (season) => season.number,
        ),
      };
    },
  }),
);
