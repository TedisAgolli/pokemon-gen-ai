import { useState } from "react";

import type { Pokemon } from "@prisma/client";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { getSupabase } from "~/integrations/supabase";
import { getAuthSession } from "~/modules/auth/session.server";
import { getPokemons } from "~/modules/note/queries";

export const handle = { i18n: ["common", "auth"] };

type LoaderData = { items: Array<Pokemon>; email: string };
export async function loader({ request }: LoaderArgs) {
  const { email } = (await getAuthSession(request)) || {};
  const data = { items: await getPokemons() };

  const supabaseClient = getSupabase();
  const dataWithImage = data.items.map(({ name, imageUrl }) => {
    const { data: imgData } = supabaseClient.storage
      .from("pokemon")
      .getPublicUrl(imageUrl);
    const publicURL = imgData?.publicURL;
    if (!publicURL) {
      return null;
    }

    return { name, imageUrl: publicURL };
  });
  return json({ items: dataWithImage, email });
}

export default function Index() {
  const { items } = useLoaderData<LoaderData>();
  const [selectedImage, setSelectedImage] = useState<string | undefined>(
    undefined
  );
  return (
    <>
      <div
        id="modal"
        className={`z-80 fixed top-0 left-0 ${
          selectedImage ? "flex" : "hidden"
        } h-screen w-screen items-center justify-center bg-black/70`}
        onClick={() => setSelectedImage(undefined)}
      >
        <img
          className="max-h-[600px] max-w-[800px] object-cover"
          alt="Selected pokemon"
          src={selectedImage}
        />
      </div>
      <ul className="mx-10 mt-24 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 ">
        {items.map(({ name, imageUrl }) => (
          <li
            key={name}
            className="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-blueGray-700  text-center shadow"
          >
            <div className="flex flex-1 flex-col p-8">
              <img
                className="mx-auto flex-shrink-0"
                src={imageUrl}
                alt=""
                onClick={() => setSelectedImage(imageUrl)}
              />
              {/* <h3 className="mt-6 text-xl font-bold text-white">{name}</h3> */}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
