import { json } from "@remix-run/node";

const TOKEN = "3cd83f4c271ae2ca232ba8bc66d7d32adbd14782";
export async function action({ request }: { request: Request }) {
  const description = (await request.formData()).get("description");
  const res = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    body: JSON.stringify({
      version:
        "3554d9e699e09693d3fa334a79c58be9a405dd021d3e11281256d53185868912",
      input: { prompt: description, num_outputs: 2 },
    }),
    headers: {
      Authorization: `Token ${TOKEN}`,
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then(async (res) => {
      const { get } = res.urls;
      let prediction;
      while (!prediction || prediction.status !== "succeeded") {
        //wait 50ms
        await new Promise((resolve) => setTimeout(resolve, 50));
        prediction = await fetch(get, {
          headers: { Authorization: `Token ${TOKEN}` },
        }).then((res) => res.json());
      }

      if (prediction.status === "succeeded") {
        const sources = prediction.output;
        return { sources };
      }
      return null;
    });
  try {
    return json(res);
  } catch (error) {
    return json({ error });
  }
}
