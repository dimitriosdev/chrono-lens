import AlbumGrid from "../../features/albums/AlbumGrid";
import Navigation from "../../components/Navigation";

export default function AlbumsPage() {
  return (
    <div className="relative min-h-screen w-full">
      <Navigation />
      <AlbumGrid />
    </div>
  );
}
