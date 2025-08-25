import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Info,
  TrendingUp,
  BarChart3,
  Eye,
  CheckCircle,
} from "lucide-react";
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
  const [expandedRec, setExpandedRec] = useState<string | null>(null);

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
        if (process.env.NODE_ENV === "development") {
          console.error("Error analyzing images:", error);
        }
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

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "high":
        return "text-green-400";
      case "medium":
        return "text-yellow-400";
      case "low":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getScoreColor = (score: number) => {
    if (score > 80) return "text-green-400";
    if (score > 60) return "text-yellow-400";
    if (score > 40) return "text-orange-400";
    return "text-red-400";
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
          {recommendations.length > 0 && !loading && (
            <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
              {recommendations[0].confidence} confidence
            </span>
          )}
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
        <div className="text-center py-6">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mb-3"></div>
          <p className="text-gray-400 text-sm">Analyzing your images...</p>
          <p className="text-gray-500 text-xs mt-1">
            Checking orientations, ratios, and visual balance
          </p>
        </div>
      )}

      {/* Enhanced image analysis summary */}
      {showDetails && imageAnalyses.length > 0 && !loading && (
        <div className="bg-gray-700 rounded-lg p-4 space-y-3">
          <h4 className="text-white text-sm font-medium flex items-center gap-2">
            <BarChart3 size={16} />
            Image Analysis
          </h4>

          {/* Orientation breakdown */}
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-300">
                {
                  imageAnalyses.filter(
                    (a) => a.dimensions.orientation === "portrait"
                  ).length
                }
              </div>
              <div className="text-gray-400">Portrait</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-green-300">
                {
                  imageAnalyses.filter(
                    (a) => a.dimensions.orientation === "landscape"
                  ).length
                }
              </div>
              <div className="text-gray-400">Landscape</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-purple-300">
                {
                  imageAnalyses.filter(
                    (a) => a.dimensions.orientation === "square"
                  ).length
                }
              </div>
              <div className="text-gray-400">Square</div>
            </div>
          </div>

          {/* Quality metrics */}
          <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-gray-600">
            <div>
              <div className="text-gray-400">Avg. Aesthetic Score</div>
              <div className="text-white font-medium">
                {Math.round(
                  (imageAnalyses.reduce(
                    (sum, img) => sum + img.dimensions.aestheticScore,
                    0
                  ) /
                    imageAnalyses.length) *
                    100
                )}
                %
              </div>
            </div>
            <div>
              <div className="text-gray-400">Visual Balance</div>
              <div className="text-white font-medium">
                {Math.round(
                  (imageAnalyses.reduce(
                    (sum, img) => sum + img.dimensions.visualWeight,
                    0
                  ) /
                    imageAnalyses.length) *
                    100
                )}
                %
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced recommendations */}
      {!loading && recommendations.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span>Top recommendations</span>
            <span>Click to apply</span>
          </div>

          {recommendations.slice(0, 3).map((rec, index) => {
            const isCurrentLayout = currentLayout.name === rec.layoutName;
            const isTopRecommendation = index === 0;
            const isExpanded = expandedRec === rec.layoutName;

            return (
              <div
                key={rec.layoutName}
                className={`relative rounded-lg border transition-all ${
                  isCurrentLayout
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-gray-600 hover:border-gray-500 bg-gray-700/50"
                }`}
              >
                <div
                  className="p-3 cursor-pointer"
                  onClick={() => handleRecommendationClick(rec)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isTopRecommendation && (
                        <TrendingUp size={16} className="text-green-400" />
                      )}
                      {isCurrentLayout && (
                        <CheckCircle size={16} className="text-blue-400" />
                      )}
                      <div>
                        <div className="text-white font-medium text-sm flex items-center gap-2">
                          {rec.layoutName}
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${getConfidenceColor(
                              rec.confidence
                            )} bg-opacity-20`}
                          >
                            {rec.confidence}
                          </span>
                        </div>
                        <div className="text-gray-400 text-xs">
                          {rec.reason}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-sm font-bold ${getScoreColor(
                          rec.score
                        )}`}
                      >
                        {Math.round(rec.score)}%
                      </div>
                      {isTopRecommendation && (
                        <div className="text-xs text-green-400">Best match</div>
                      )}
                    </div>
                  </div>

                  {/* Enhanced score bar */}
                  <div className="mt-3 w-full bg-gray-600 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        rec.score > 80
                          ? "bg-gradient-to-r from-green-500 to-green-400"
                          : rec.score > 60
                          ? "bg-gradient-to-r from-yellow-500 to-yellow-400"
                          : rec.score > 40
                          ? "bg-gradient-to-r from-orange-500 to-orange-400"
                          : "bg-gradient-to-r from-red-500 to-red-400"
                      }`}
                      style={{ width: `${Math.min(rec.score, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Detailed analysis popup */}
                {showDetails && (
                  <button
                    className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedRec(isExpanded ? null : rec.layoutName);
                    }}
                  >
                    <Eye size={14} />
                  </button>
                )}

                {/* Expanded details */}
                {isExpanded && showDetails && (
                  <div className="border-t border-gray-600 p-3 bg-gray-750 text-xs space-y-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-gray-400">
                          Orientation Match:
                        </span>
                        <span className="text-white ml-2">
                          {Math.round(rec.detailedAnalysis.orientationMatch)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">
                          Image Count Match:
                        </span>
                        <span className="text-white ml-2">
                          {Math.round(rec.detailedAnalysis.imageCountMatch)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Aesthetic Score:</span>
                        <span className="text-white ml-2">
                          {Math.round(rec.detailedAnalysis.aestheticScore)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Visual Balance:</span>
                        <span className="text-white ml-2">
                          {Math.round(rec.detailedAnalysis.balanceScore)}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* No recommendations */}
      {!loading && recommendations.length === 0 && images.length > 0 && (
        <div className="text-center py-6 text-gray-400 space-y-2">
          <Sparkles size={24} className="mx-auto opacity-50" />
          <p className="text-sm">
            Unable to analyze images for recommendations
          </p>
          <p className="text-xs">
            Try adding more images or check image formats
          </p>
        </div>
      )}
    </div>
  );
}
