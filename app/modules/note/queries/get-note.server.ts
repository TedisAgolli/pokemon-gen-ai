import type { Pokemon, User } from "~/database";
import { db } from "~/database";

export async function getNote({
  userId,
  id,
}: Pick<Pokemon, "id"> & {
  userId: User["id"];
}) {
  return db.pokemon.findFirst({
    select: { id: true, body: true, title: true },
    where: { id, userId },
  });
}
