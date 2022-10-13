import { useEffect, useState } from "react";

import type { LoaderArgs, ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useFetcher, useTransition } from "@remix-run/react";
import { v4 as uuidv4 } from "uuid";

import { getSupabase } from "~/integrations/supabase";
import { requireAuthSession } from "~/modules/auth/guards";
import { getAuthSession } from "~/modules/auth/session.server";
import { createPokemon } from "~/modules/note/mutations";

export async function loader({ request }: LoaderArgs) {
  const authSession = await getAuthSession(request);
  if (!authSession) return redirect("/login");
  return {};
}

export const action: ActionFunction = async ({ request }) => {
  const authSession = await requireAuthSession(request);
  const supabaseClient = getSupabase();

  const formData = await request.formData();
  const imgSrc = formData.get("imgSrc") as string;
  const imgBlob = await fetch(imgSrc).then((res) => res.blob());

  const filePath = uuidv4();
  const { error } = await supabaseClient.storage
    .from("pokemon")
    .upload(filePath, imgBlob, {
      upsert: true,
    });
  if (error) {
    throw error;
  }

  await createPokemon({
    name: uuidv4(),
    imageUrl: filePath as string,
    userId: authSession.userId,
  });
  return redirect("/");
};

export default function IndexRoute() {
  const pokemonImageFetcher = useFetcher();
  const transition = useTransition();
  const [pokemonSources, setPokemonSources] = useState([]);
  const [selectedImage, setSelectedImage] = useState<string>();
  useEffect(() => {
    if (pokemonImageFetcher && pokemonImageFetcher.data) {
      setPokemonSources(pokemonImageFetcher.data.sources);
    }
  }, [pokemonImageFetcher]);
  return (
    <>
      <div className="mt-5 flex justify-center text-center">
        <pokemonImageFetcher.Form
          method="post"
          action="/create/pokemonImage"
        >
          <div className="mt-6 w-[50vh]">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-white "
            >
              Description
            </label>
            <input
              required={true}
              type="text"
              name="description"
              id="description"
              className="mt-2 block w-full flex-1 rounded-md border-gray-300 p-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />

            <div className="flex flex-col items-center">
              {pokemonImageFetcher.submission ? (
                <button
                  type="submit"
                  disabled={true}
                  className="mt-3 inline-flex cursor-not-allowed justify-center rounded-md border border-transparent bg-amber-500 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                >
                  <svg
                    className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Generating...
                </button>
              ) : (
                <button
                  type="submit"
                  className="mt-3 inline-flex w-fit justify-center rounded-md border border-transparent bg-amber-500 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                >
                  Generate image
                </button>
              )}
              <span className="mt-5 font-light text-gray-300">
                Usually takes 10-20 seconds, generates 2 images
              </span>
            </div>
          </div>
        </pokemonImageFetcher.Form>
      </div>
      <div className="mx-3 mt-5 flex justify-center space-x-5">
        {pokemonSources.map((source) => (
          <button
            key={source}
            onClick={() => setSelectedImage(source)}
          >
            <img
              //   src={
              //     "https://replicate.com/api/models/lambdal/text-to-pokemon/files/4391014f-80f2-48c9-ad10-07bf3017616d/out-0.png"
              //   }
              className={` border border-dashed p-2 hover:border-orange-500 ${
                selectedImage !== source && "opacity-30"
              }`}
              alt="Pokemon"
              key={source}
              src={source}
            />
          </button>
        ))}
      </div>
      {pokemonSources.length && (
        <div className="flex justify-center">
          <Form
            method="post"
            className="space-y-8 divide-y divide-gray-200 "
          >
            <input
              required={true}
              value={pokemonSources[0]}
              type="text"
              name="imgSrc"
              id="imgSrc"
              className="hidden"
            />
            <div className="flex flex-col justify-center pt-5">
              <span className="mt-5 font-semibold text-gray-300">
                Choose one of the two images to upload
              </span>
              <button
                type="submit"
                disabled={!!transition.submission}
                className="ml-3 mt-2 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {transition.submission ? "Uploading..." : "Upload"}
              </button>
            </div>
          </Form>
        </div>
      )}
    </>
  );
}
