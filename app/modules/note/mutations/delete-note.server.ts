import type { Pokemon, User } from "~/database";
import { db } from "~/database";

export async function deleteNote({
  id,
  userId,
}: Pick<Pokemon, "id"> & { userId: User["id"] }) {
  return db.pokemon.deleteMany({
    where: { id, userId },
  });
}
