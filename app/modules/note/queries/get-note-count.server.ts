import { db } from "~/database";

export async function getNoteCount() {
  return db.pokemon.count();
}
