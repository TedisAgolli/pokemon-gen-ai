import { db } from "~/database";

export async function getPokemons() {
  return db.pokemon.findMany({
    select: { name: true, imageUrl: true },
    orderBy: { createdAt: "desc" },
  });
}
