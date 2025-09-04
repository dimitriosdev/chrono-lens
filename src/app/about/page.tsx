import Link from "next/link";
import { Metadata } from "next";
import "../globals.css";
import { BackgroundImage } from "../../shared/components";
import Navigation from "../../features/navigation/components/Navigation";
import { getVersionInfo } from "../../shared/lib/version";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Chrono Lens - a modern photo album app designed to help you capture, organize, and revisit your favorite memories.",
};

export default function AboutPage() {
  const versionInfo = getVersionInfo();

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <BackgroundImage imageUrl="/bg-img.jpg" />
      <div className="flex justify-center w-full pt-8 pb-8 relative z-10">
        <Navigation />
        <main className="flex-1">
          <div className="w-full max-w-2xl bg-gray-900 rounded-2xl shadow-2xl mx-auto p-6 text-center space-y-6">
            {/* Main About Section */}
            <div>
              <h1 className="text-3xl font-bold text-cyan-400 mb-4">
                About Chrono Lens
              </h1>
              <p className="text-gray-300 mb-4">
                Chrono Lens is a modern photo album app designed to help you
                capture, organize, and revisit your favorite memories. Our
                intention is to make photo management simple, beautiful, and
                accessible for everyone.
              </p>
              <p className="text-gray-300">
                If you have any questions, feedback, or suggestions, feel free
                to reach out:
                <br />
                <Link
                  href="mailto:dimitrios.dev@gmail.com"
                  style={{ color: "#0070f3", textDecoration: "underline" }}
                >
                  dimitrios.dev@gmail.com
                </Link>
              </p>
            </div>

            {/* Version Information Section */}
            <div className="border-t border-gray-700 pt-6">
              <h2 className="text-xl font-semibold text-cyan-400 mb-4">
                Version Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="text-cyan-300 font-medium">Version</div>
                  <div className="text-gray-300 font-mono">
                    {versionInfo.version}
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="text-cyan-300 font-medium">Environment</div>
                  <div className="text-gray-300 capitalize">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        versionInfo.environment === "production"
                          ? "bg-green-600 text-white"
                          : versionInfo.environment === "development"
                          ? "bg-yellow-600 text-white"
                          : "bg-blue-600 text-white"
                      }`}
                    >
                      {versionInfo.environment}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="text-cyan-300 font-medium">Build Date</div>
                  <div className="text-gray-300">{versionInfo.buildDate}</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="text-cyan-300 font-medium">Git Commit</div>
                  <div className="text-gray-300 font-mono">
                    {versionInfo.commitHash.substring(0, 8)}
                  </div>
                </div>
                {versionInfo.environment === "development" && (
                  <div className="bg-gray-800 rounded-lg p-3 md:col-span-2">
                    <div className="text-cyan-300 font-medium">
                      Full Version
                    </div>
                    <div className="text-gray-300 font-mono text-xs">
                      {versionInfo.fullVersion}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tech Stack Section */}
            <div className="border-t border-gray-700 pt-6">
              <h2 className="text-xl font-semibold text-cyan-400 mb-4">
                Built With
              </h2>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                  Next.js
                </span>
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                  React
                </span>
                <span className="bg-blue-700 text-white px-3 py-1 rounded-full text-sm">
                  TypeScript
                </span>
                <span className="bg-teal-600 text-white px-3 py-1 rounded-full text-sm">
                  Tailwind CSS
                </span>
                <span className="bg-orange-600 text-white px-3 py-1 rounded-full text-sm">
                  Firebase
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
