import Link from "next/link";

export default function AboutPage() {
  return (
    <main style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h1>About Chrono Lens</h1>
      <p>
        Chrono Lens is a modern photo album app designed to help you capture,
        organize, and revisit your favorite memories. Our intention is to make
        photo management simple, beautiful, and accessible for everyone.
      </p>
      <p>
        If you have any questions, feedback, or suggestions, feel free to reach
        out:
        <br />
        <Link
          href="mailto:contact@chronolens.app"
          style={{ color: "#0070f3", textDecoration: "underline" }}
        >
          contact@chronolens.app
        </Link>
      </p>
    </main>
  );
}
