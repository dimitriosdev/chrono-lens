import Link from "next/link";
import { Metadata } from "next";
import BackgroundImage from "../../components/BackgroundImage";
import Navigation from "../../components/Navigation";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Chrono Lens - a modern photo album app designed to help you capture, organize, and revisit your favorite memories.",
};

export default function AboutPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <BackgroundImage imageUrl="/bg-img.jpg" />
      <div className="flex justify-center w-full pt-8 pb-8 relative z-10">
        <Navigation />
        <main className="flex-1">
          <div className="w-full max-w-xl bg-gray-900 rounded-2xl shadow-2xl mx-auto p-6 text-center">
            <h1 className="text-3xl font-bold text-cyan-400 mb-4">
              About Chrono Lens
            </h1>
            <p>
              Chrono Lens is a modern photo album app designed to help you
              capture, organize, and revisit your favorite memories. Our
              intention is to make photo management simple, beautiful, and
              accessible for everyone.
            </p>
            <p>
              If you have any questions, feedback, or suggestions, feel free to
              reach out:
              <br />
              <Link
                href="mailto:contact@chronolens.app"
                style={{ color: "#0070f3", textDecoration: "underline" }}
              >
                contact@chronolens.app
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
