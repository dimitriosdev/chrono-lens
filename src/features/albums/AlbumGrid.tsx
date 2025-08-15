type Album = {
  title: string;
  image: string;
};

const placeholderAlbums: Album[] = [
  { title: "Best hiking trails in Slovenia", image: "/placeholder1.jpg" },
  { title: "Best hotels in the Catskills", image: "/placeholder2.jpg" },
  { title: "2 night Luxury stay in Japan", image: "/placeholder3.jpg" },
  { title: "Things to do in the Dolomites", image: "/placeholder4.jpg" },
  { title: "Sunset hike in Alaska", image: "/placeholder5.jpg" },
  { title: "Dune tours in the deserts of Nambia", image: "/placeholder6.jpg" },
  {
    title: "Remote mountain hotels in Arizona with clear skies",
    image: "/placeholder7.jpg",
  },
  { title: "Forest hotels in Sweden for solitude", image: "/placeholder8.jpg" },
];

export default function AlbumGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4 sm:p-8">
      {placeholderAlbums.map((album, idx) => (
        <div
          key={idx}
          className="bg-gray-800 rounded-xl overflow-hidden shadow-lg flex flex-col justify-end min-h-[220px] sm:min-h-[240px] lg:min-h-[260px] relative"
        >
          <div className="absolute inset-0">
            {/* Placeholder for image, replace with <Image /> for real images */}
            <div className="object-cover w-full h-full opacity-80 bg-gray-700" />
          </div>
          <div className="relative z-10 p-4 flex items-end h-full">
            <span className="text-white text-base font-semibold drop-shadow-lg text-shadow-md">
              {album.title}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
