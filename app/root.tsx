import { PlusIcon } from "@heroicons/react/20/solid";
import type {
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { useChangeLanguage } from "remix-i18next";

import i18next from "~/i18next.server";
import { getAuthSession } from "~/modules/auth/session.server";

import tailwindStylesheetUrl from "./styles/tailwind.css";
import { getBrowserEnv } from "./utils/env";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: tailwindStylesheetUrl },
];

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Pokemon: Gen AI",
  viewport: "width=device-width,initial-scale=1",
});

export const loader: LoaderFunction = async ({ request }) => {
  const locale = await i18next.getLocale(request);
  const { email } = (await getAuthSession(request)) || {};

  return json({
    email,
    locale,
    env: getBrowserEnv(),
  });
};

export const handle = {
  // In the handle export, we can add a i18n key with namespaces our route
  // will need to load. This key can be a single string or an array of strings.
  // TIP: In most cases, you should set this to your defaultNS from your i18n config
  // or if you did not set one, set it to the i18next default namespace "translation"
  i18n: "common",
};

export default function App() {
  const { email, env, locale } = useLoaderData<typeof loader>();
  const { i18n } = useTranslation();

  useChangeLanguage(locale);

  return (
    <html
      lang={locale}
      dir={i18n.dir()}
      className="h-full"
    >
      <head>
        <Meta />
        <Links />
      </head>
      <body className="bg-blueGray-800">
        <div className="mt-8 mr-5 grid grid-cols-3 justify-items-stretch ">
          <div></div>
          <div className="flex flex-col items-center">
            <Link
              className="justify-self-center"
              to={"/"}
            >
              <h1 className="text-5xl font-extrabold text-white">
                <span className="text-amber-400">Pokemon: </span>
                <span className="italic">Gen AI</span>
              </h1>
            </Link>
            <Link
              to={"/about"}
              className="text-blue-600 underline visited:text-purple-600 hover:text-blue-800"
            >
              <span className="font-light text-white">What is this?</span>
            </Link>
          </div>

          <div className="flex flex-col justify-self-end">
            <Link
              to={"/create"}
              className="relative inline-flex w-max items-center rounded-md border border-transparent bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              <PlusIcon
                className="-ml-1 mr-2 h-5 w-5"
                aria-hidden="true"
              />
              <span>Create</span>
            </Link>
            {email && (
              <span className="text-gray-400">
                Logged in as <span className="italic">{email}</span>
              </span>
            )}
          </div>
        </div>
        <Outlet />

        <ScrollRestoration />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.env = ${JSON.stringify(env)}`,
          }}
        />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
