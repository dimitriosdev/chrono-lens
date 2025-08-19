import Link from "next/link";

export default function NotFoundPage() {
  // Fun photo-related 404 message
  const message = "️ This picture fell out of the album somewhere";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950 flex items-center justify-center p-4">
      <div className="max-w-md text-center">
        {/* Camera Icon Animation */}
        <div className="mb-8 relative">
          <div className="w-32 h-32 mx-auto bg-gray-800 rounded-2xl flex items-center justify-center shadow-2xl border border-gray-700">
            <div className="text-6xl animate-pulse">📷</div>
          </div>
          {/* Flash effect */}
          <div className="absolute inset-0 w-32 h-32 mx-auto bg-white rounded-2xl opacity-0 animate-ping"></div>
        </div>

        {/* Error Message */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-blue-400 mb-4 animate-bounce">
            404
          </h1>
          <p className="text-xl text-gray-300 mb-6 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            📱 Return to Photo Albums
          </Link>
        </div>
      </div>

      {/* Floating Photo Frames */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-16 h-16 bg-gray-800 rounded-lg opacity-20 transform rotate-12 animate-float"></div>
        <div className="absolute top-40 right-20 w-12 h-12 bg-gray-700 rounded-lg opacity-15 transform -rotate-6 animate-float-delayed"></div>
        <div className="absolute bottom-32 left-20 w-20 h-16 bg-gray-800 rounded-lg opacity-10 transform rotate-45 animate-float-slow"></div>
        <div className="absolute bottom-20 right-16 w-14 h-14 bg-gray-700 rounded-lg opacity-20 transform -rotate-12 animate-float"></div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(12deg);
          }
          50% {
            transform: translateY(-20px) rotate(12deg);
          }
        }
        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0px) rotate(-6deg);
          }
          50% {
            transform: translateY(-15px) rotate(-6deg);
          }
        }
        @keyframes float-slow {
          0%,
          100% {
            transform: translateY(0px) rotate(45deg);
          }
          50% {
            transform: translateY(-10px) rotate(45deg);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 4s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
