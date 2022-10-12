import * as React from "react";

import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { getFormData } from "remix-params-helper";
import { z } from "zod";

import i18next from "~/i18next.server";
import { ContinueWithEmailForm } from "~/modules/auth/components";
import { signInWithEmail } from "~/modules/auth/mutations";
import {
  createAuthSession,
  getAuthSession,
} from "~/modules/auth/session.server";
import { assertIsPost } from "~/utils/http.server";

export async function loader({ request }: LoaderArgs) {
  const authSession = await getAuthSession(request);
  const t = await i18next.getFixedT(request, "auth");
  const title = t("login.title");

  if (authSession) return redirect("/notes");

  return json({ title });
}

const LoginFormSchema = z.object({
  email: z
    .string()
    .email("invalid-email")
    .transform((email) => email.toLowerCase()),
  password: z.string().min(8, "password-too-short"),
  redirectTo: z.string().optional(),
});

export async function action({ request }: ActionArgs) {
  assertIsPost(request);

  const formValidation = await getFormData(request, LoginFormSchema);

  if (!formValidation.success) {
    return json(
      {
        errors: {
          email: formValidation.errors.email,
          password: formValidation.errors.password,
        },
      },
      { status: 400 }
    );
  }

  const { email, password, redirectTo = "/create" } = formValidation.data;

  const authSession = await signInWithEmail(email, password);

  if (!authSession) {
    return json(
      { errors: { email: "invalid-email-password", password: null } },
      { status: 400 }
    );
  }

  return createAuthSession({
    request,
    authSession,
    redirectTo,
  });
}

export const meta: MetaFunction = ({ data }) => ({
  title: data.title,
});

export const handle = { i18n: "auth" };

export default function LoginPage() {
  const actionData = useActionData<typeof action>();
  const emailRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  return (
    <div className="flex flex-col items-center">
      <div className="mx-auto mt-10 max-w-xl px-8">
        <p className="mb-5 font-semibold text-gray-200">
          This website uses a model hosted by{" "}
          <a
            className="text-blue-600 underline visited:text-purple-600 hover:text-blue-800"
            href="https://replicate.com/"
          >
            Replicate
          </a>
          . They provide a generous free tier, but if a lot of people use this
          website it might end up consting money. Asking you to log in helps
          minimize spam.
        </p>
        <p className="mb-2 text-sm font-normal text-gray-300">
          If you want to play with the image generator, go to{" "}
          <a
            className="text-blue-600 underline visited:text-purple-600 hover:text-blue-800"
            href="https://replicate.com/lambdal/text-to-pokemon"
          >
            replicate/text-to-pokemon
          </a>{" "}
          and use their generous free tier.
        </p>
      </div>
      <div className="mt-8 w-64 lg:w-96">
        <ContinueWithEmailForm />
      </div>
    </div>
  );
}
