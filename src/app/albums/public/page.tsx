/**
 * Public Albums Gallery Page
 *
 * Displays all public albums for discovery
 * No authentication required - anyone can browse
 */

"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GlobeAltIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Album } from "@/shared/types/album";
import { getPublicAlbums } from "@/shared/lib/firestore";
import { Navigation } from "@/features/navigation";
import { AlbumGrid } from "@/features/albums";
import Link from "next/link";

export default function PublicAlbumsPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadPublicAlbums();
  }, []);

  const loadPublicAlbums = async () => {
    try {
      setLoading(true);
      setError("");
      const publicAlbums = await getPublicAlbums(50); // Load up to 50 albums
      setAlbums(publicAlbums);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load public albums"
      );
    } finally {
      setLoading(false);
    }
  };

  // Filter albums based on search query
  const filteredAlbums = React.useMemo(() => {
    if (!searchQuery.trim()) return albums;

    const query = searchQuery.toLowerCase();
    return albums.filter(
      (album) =>
        album.title.toLowerCase().includes(query) ||
        album.description?.toLowerCase().includes(query) ||
        album.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  }, [albums, searchQuery]);

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />

      <div className="pt-14 sm:pt-0 sm:ml-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <GlobeAltIcon className="w-12 h-12 text-green-400" />
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                Public Gallery
              </h1>
            </div>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Explore beautiful photo albums shared by our community
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 max-w-2xl mx-auto"
          >
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Search albums by title, description, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-white/20 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-white/60">Loading public albums...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center"
            >
              <p className="text-red-200">{error}</p>
              <button
                onClick={loadPublicAlbums}
                className="mt-4 px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
            </motion.div>
          )}

          {/* Albums Grid */}
          {!loading && !error && (
            <>
              {filteredAlbums.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="mb-6 flex items-center justify-between">
                    <p className="text-white/60">
                      {filteredAlbums.length} album
                      {filteredAlbums.length !== 1 ? "s" : ""} found
                    </p>
                  </div>
                  <AlbumGrid albums={filteredAlbums} />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20"
                >
                  <GlobeAltIcon className="w-20 h-20 text-white/20 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold text-white mb-2">
                    {searchQuery ? "No albums found" : "No public albums yet"}
                  </h3>
                  <p className="text-white/60 mb-8">
                    {searchQuery
                      ? "Try adjusting your search query"
                      : "Be the first to share an album with the community!"}
                  </p>
                  {!searchQuery && (
                    <Link
                      href="/albums/new"
                      className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Create Album
                    </Link>
                  )}
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
