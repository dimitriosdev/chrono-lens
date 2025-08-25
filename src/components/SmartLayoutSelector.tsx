import React, { useState, useEffect } from "react";
import { Sparkles, Info, TrendingUp } from "lucide-react";
import {
  getSmartLayoutRecommendations,
  LayoutRecommendation,
  ImageAnalysis,
  analyzeImages,
} from "@/utils/imageAnalysis";
import { ALBUM_LAYOUTS, AlbumLayout } from "@/features/albums/AlbumLayout";

interface SmartLayoutSelectorProps {
  images: Array<{ file?: File; url: string; id: string }>;
  currentLayout: AlbumLayout;
  onLayoutChange: (layout: AlbumLayout) => void;
  className?: string;
}

export function SmartLayoutSelector({
  images,
  currentLayout,
  onLayoutChange,
  className = "",
}: SmartLayoutSelectorProps) {
  const [recommendations, setRecommendations] = useState<
    LayoutRecommendation[]
  >([]);
  const [imageAnalyses, setImageAnalyses] = useState<ImageAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (images.length === 0) {
      setRecommendations([]);
      setImageAnalyses([]);
      return;
    }

    const analyzeAndRecommend = async () => {
      setLoading(true);
      try {
        // Analyze images
        const analyses = await analyzeImages(images);
        setImageAnalyses(analyses);

        // Get recommendations
        const recs = await getSmartLayoutRecommendations(images);
        setRecommendations(recs);

        // Auto-select best layout if current is Smart Layout
        if (currentLayout.isSmartLayout && recs.length > 0) {
          const bestLayout = ALBUM_LAYOUTS.find(
            (l) => l.name === recs[0].layoutName
          );
          if (bestLayout && !bestLayout.isSmartLayout) {
            onLayoutChange(bestLayout);
          }
        }
      } catch (error) {
        console.error("Error analyzing images:", error);
      } finally {
        setLoading(false);
      }
    };

    analyzeAndRecommend();
  }, [images, currentLayout.isSmartLayout, onLayoutChange]);

  const handleRecommendationClick = (rec: LayoutRecommendation) => {
    const layout = ALBUM_LAYOUTS.find((l) => l.name === rec.layoutName);
    if (layout) {
      onLayoutChange(layout);
    }
  };

  if (images.length === 0) {
    return (
      <div className={`bg-gray-800 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-2 text-gray-400">
          <Sparkles size={20} />
          <span className="text-sm">
            Add images to see smart layout suggestions
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 rounded-lg p-4 space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={20} className="text-blue-400" />
          <h3 className="text-white font-medium">Smart Layout Suggestions</h3>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-gray-400 hover:text-white transition-colors"
          aria-label="Toggle details"
        >
          <Info size={16} />
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
          <p className="text-gray-400 text-sm mt-2">Analyzing your images...</p>
        </div>
      )}

      {/* Image analysis summary */}
      {showDetails && imageAnalyses.length > 0 && (
        <div className="bg-gray-700 rounded-lg p-3 space-y-2">
          <h4 className="text-white text-sm font-medium">Image Analysis</h4>
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="text-center">
              <div className="text-gray-300">
                {
                  imageAnalyses.filter(
                    (a) => a.dimensions.orientation === "portrait"
                  ).length
                }
              </div>
              <div className="text-gray-400">Portrait</div>
            </div>
            <div className="text-center">
              <div className="text-gray-300">
                {
                  imageAnalyses.filter(
                    (a) => a.dimensions.orientation === "landscape"
                  ).length
                }
              </div>
              <div className="text-gray-400">Landscape</div>
            </div>
            <div className="text-center">
              <div className="text-gray-300">
                {
                  imageAnalyses.filter(
                    (a) => a.dimensions.orientation === "square"
                  ).length
                }
              </div>
              <div className="text-gray-400">Square</div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {!loading && recommendations.length > 0 && (
        <div className="space-y-2">
          {recommendations.slice(0, 3).map((rec, index) => {
            const isCurrentLayout = currentLayout.name === rec.layoutName;
            const isTopRecommendation = index === 0;

            return (
              <div
                key={rec.layoutName}
                className={`relative p-3 rounded-lg border cursor-pointer transition-all ${
                  isCurrentLayout
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-gray-600 hover:border-gray-500 bg-gray-700/50"
                }`}
                onClick={() => handleRecommendationClick(rec)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isTopRecommendation && (
                      <TrendingUp size={16} className="text-green-400" />
                    )}
                    <div>
                      <div className="text-white font-medium text-sm">
                        {rec.layoutName}
                      </div>
                      <div className="text-gray-400 text-xs">{rec.reason}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-sm font-medium ${
                        rec.score > 80
                          ? "text-green-400"
                          : rec.score > 60
                          ? "text-yellow-400"
                          : "text-gray-400"
                      }`}
                    >
                      {Math.round(rec.score)}%
                    </div>
                    {isTopRecommendation && (
                      <div className="text-xs text-green-400">Best match</div>
                    )}
                  </div>
                </div>

                {/* Score bar */}
                <div className="mt-2 w-full bg-gray-600 rounded-full h-1">
                  <div
                    className={`h-1 rounded-full transition-all ${
                      rec.score > 80
                        ? "bg-green-400"
                        : rec.score > 60
                        ? "bg-yellow-400"
                        : "bg-gray-400"
                    }`}
                    style={{ width: `${Math.min(rec.score, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* No recommendations */}
      {!loading && recommendations.length === 0 && images.length > 0 && (
        <div className="text-center py-4 text-gray-400">
          <p className="text-sm">
            Unable to analyze images for recommendations
          </p>
        </div>
      )}
    </div>
  );
}
