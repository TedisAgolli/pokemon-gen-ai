import { Form, useTransition } from "@remix-run/react";
import ImageUpload from "./imageUpload";

export default function PokemonForm() {
  const transition = useTransition();
  return (
    <div className="flex justify-center">
      <Form
        method="post"
        encType="multipart/form-data"
        className="space-y-8 divide-y divide-gray-200 "
      >
        <div className="mt-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-white "
            >
              Name
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                required={true}
                type="text"
                name="name"
                id="name"
                className="block w-full min-w-0 flex-1 rounded-md border-gray-300 p-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          <div className="mt-4">
            <label
              htmlFor="cover-photo"
              className="block text-sm font-medium text-white"
            >
              Cover photo
            </label>
            <ImageUpload />
          </div>
        </div>
        <div className="flex justify-center pt-5">
          <button
            type="submit"
            disabled={transition.submission}
            className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {transition.submission ? "Uploading..." : "Upload"}
          </button>
        </div>
      </Form>
    </div>
  );
}
