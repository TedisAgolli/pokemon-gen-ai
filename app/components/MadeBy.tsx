export function MadeBy() {
  return (
    <div className="absolute bottom-3 right-3 text-white">
      <span className="font-bold">Pokemon Gen AI</span> <span>made by </span>
      <a
        className="text-white underline"
        href="https://tedis.me"
        target="_blank"
        rel="noreferrer"
      >
        Tedis
      </a>
      <span
        role="img"
        aria-label="wave"
      >
        {" "}
        👋
      </span>
    </div>
  );
}
