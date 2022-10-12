export default function AboutRoute() {
  return (
    <div className="mx-auto mt-28 max-w-2xl text-center text-xl font-bold text-white">
      <h1>We are crowdsourcing a new Pokemon Generation, generated with AI!</h1>
      <p className="mt-2">
        Using the{" "}
        <a
          className="text-blue-600 underline visited:text-purple-600 hover:text-blue-800"
          href="https://replicate.com/lambdal/text-to-pokemon"
        >
          text-to-pokemon
        </a>{" "}
        model, you can create your own Pokemon with just a short description.
      </p>
      <p className="mt-8 font-light italic text-gray-300">
        Upvoting coming soon.
      </p>
    </div>
  );
}
