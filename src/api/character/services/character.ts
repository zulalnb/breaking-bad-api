/**
 * character service
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreService(
  "api::character.character",
  ({ strapi }) => ({
    async getShapedCharacters(params: any, baseUrl: string) {
      const { filters, pagination } = params;

      const characters = await strapi
        .documents("api::character.character")
        .findMany({
          status: "published",
          filters,
          pagination,
          fields: ["name", "birthday", "nickname", "characterStatus"],
          populate: {
            category: { fields: ["name"] },
            appearance: { fields: ["number"] },
            better_call_saul_appearance: { fields: ["number"] },
            portrayed: { fields: ["name"] },
            occupation: true,
            img: { fields: ["url"] },
          },
        });

      return characters.map((char: any) => this.shapeCharacter(char, baseUrl));
    },

    async getShapedCharacter(documentId: string, baseUrl: string) {
      const character = await strapi
        .documents("api::character.character")
        .findOne({
          documentId,
          status: "published",
          fields: ["name", "birthday", "nickname", "characterStatus"],
          populate: {
            category: { fields: ["name"] },
            appearance: { fields: ["number"] },
            better_call_saul_appearance: { fields: ["number"] },
            portrayed: { fields: ["name"] },
            occupation: true,
            img: { fields: ["url"] },
          },
        });

      return character ? this.shapeCharacter(character, baseUrl) : null;
    },

    shapeCharacter(char: any, baseUrl: string) {
      return {
        char_id: char.documentId,
        name: char.name,
        birthday: char.birthday ?? "Unknown",
        occupation: char.occupation?.map((occ: any) => occ.value) || [],
        img: char.img
          ? `${baseUrl}${char.img.url}`
          : `${baseUrl}/uploads/placeholder_image_blue_landscape_455db0de45.png`,
        status: char.characterStatus,
        nickname: char.nickname ?? "Unknown",
        appearance: char.appearance?.map((season: any) => season.number) || [],
        portrayed: char.portrayed?.name ?? "Unknown",
        category: char.category?.map((cat: any) => cat.name) || [],
        better_call_saul_appearance:
          char.better_call_saul_appearance?.map(
            (season: any) => season.number,
          ) || [],
      };
    },
  }),
);
