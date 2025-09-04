"use client";
import { AlbumGrid } from "../../features/albums";
import { AlbumForm } from "../../features/albums";
import Navigation from "../../features/navigation/components/Navigation";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AlbumsPage() {
  const { isSignedIn, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && !isSignedIn) {
      router.replace("/");
    }
  }, [isSignedIn, loading, router]);
  if (loading) return null;
  if (!isSignedIn) return null;
  return (
    <div className="relative min-h-screen w-full">
      <Navigation />
      <div className="pt-14 sm:pt-0 sm:ml-20">
        <AlbumGrid />
      </div>
    </div>
  );
}
