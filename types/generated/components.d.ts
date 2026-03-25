import type { Schema, Struct } from "@strapi/strapi";

export interface OccupationOccupationItem extends Struct.ComponentSchema {
  collectionName: "components_occupation_occupation_items";
  info: {
    displayName: "OccupationItem";
  };
  attributes: {
    value: Schema.Attribute.String;
  };
}

declare module "@strapi/strapi" {
  export module Public {
    export interface ComponentSchemas {
      "occupation.occupation-item": OccupationOccupationItem;
    }
  }
}
