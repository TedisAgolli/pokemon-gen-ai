import type { Pokemon, User } from "~/database";
import { db } from "~/database";

export async function createPokemon({
  name,
  imageUrl,
  userId,
}: Pick<Pokemon, "name" | "imageUrl"> & {
  userId: User["id"];
}) {
  return db.pokemon.create({
    data: {
      name,
      imageUrl,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}
