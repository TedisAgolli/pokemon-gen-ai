import * as React from "react";

import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useSearchParams,
  useTransition,
} from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { getFormData, useFormInputProps } from "remix-params-helper";
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

  const { email, password, redirectTo = "/notes" } = formValidation.data;

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
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;
  const actionData = useActionData<typeof action>();
  const emailRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);
  const inputProps = useFormInputProps(LoginFormSchema);
  const transition = useTransition();
  const { t } = useTranslation("auth");
  const disabled =
    transition.state === "submitting" || transition.state === "loading";

  React.useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  return (
    <div className="mx-auto mt-10 w-full max-w-md px-8">
      <ContinueWithEmailForm />
    </div>
  );
}
