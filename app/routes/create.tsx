import {
  ActionFunction,
  unstable_composeUploadHandlers,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
  redirect,
} from "@remix-run/node";

// Import the Prisma client
import PokemonForm from "~/components/pokemonForm";
import { getSupabase } from "~/integrations/supabase";
import { requireAuthSession } from "~/modules/auth/guards";
import { getAuthSession } from "~/modules/auth/session.server";
import { createPokemon } from "~/modules/note/mutations";

const asyncIterableToStream = (asyncIterable: AsyncIterable<Uint8Array>) => {
  return new ReadableStream({
    async pull(controller) {
      for await (const entry of asyncIterable) {
        controller.enqueue(entry);
      }
      controller.close();
    },
  });
};

export const action: ActionFunction = async ({ request }) => {
  const authSession = await requireAuthSession(request);
  const supabaseClient = getSupabase();
  const uploadHandler = unstable_composeUploadHandlers(async (file) => {
    if (file.name !== "image") {
      return undefined;
    }

    const stream = asyncIterableToStream(file.data);

    const filepath = `${Math.random()}-${file.filename}`;
    const { data, error } = await supabaseClient.storage
      .from("pokemon")
      .upload(filepath, stream, {
        contentType: file.contentType,
        upsert: true,
      });

    if (error) {
      throw error;
    }

    return filepath;
  }, unstable_createMemoryUploadHandler());

  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler
  );

  const name = formData.get("name");
  const filePath = formData.get("image");
  console.log("data submitted", name, filePath, authSession.userId);

  await createPokemon({
    name: name as string,
    imageUrl: filePath as string,
    userId: authSession.userId,
  });
  return redirect("/");
};

export default function IndexRoute() {
  // This hook returns the JSON parsed data from your route loader function.
  return (
    <>
      <div className="mt-5 text-center">
        <span className="font-bold text-white">
          Go{" "}
          <a
            className="text-blue-600 underline visited:text-purple-600 hover:text-blue-800"
            href="https://replicate.com/lambdal/text-to-pokemon"
          >
            here
          </a>{" "}
          to generate a custom Pokemon
        </span>
      </div>
      <PokemonForm />
    </>
  );
}
