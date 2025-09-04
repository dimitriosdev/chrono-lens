"use client";

import React from "react";

interface ImageErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  retryCount: number;
}

interface ImageErrorBoundaryProps {
  children: React.ReactNode;
  src?: string;
  alt?: string;
  maxRetries?: number;
  fallback?: React.ComponentType<{
    src?: string;
    alt?: string;
    error?: Error;
    retry: () => void;
    canRetry: boolean;
  }>;
  onError?: (error: Error, src?: string) => void;
}

class ImageErrorBoundary extends React.Component<
  ImageErrorBoundaryProps,
  ImageErrorBoundaryState
> {
  private retryTimeouts: number[] = [];

  constructor(props: ImageErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(
    error: Error
  ): Partial<ImageErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Image Error Boundary caught an error:", error, errorInfo);

    if (this.props.onError) {
      this.props.onError(error, this.props.src);
    }
  }

  componentWillUnmount() {
    // Clear any pending retry timeouts
    this.retryTimeouts.forEach((timeout) => clearTimeout(timeout));
  }

  handleRetry = () => {
    const { maxRetries = 3 } = this.props;

    if (this.state.retryCount < maxRetries) {
      this.setState((prevState) => ({
        retryCount: prevState.retryCount + 1,
      }));

      // Retry after a delay (exponential backoff)
      const delay = Math.pow(2, this.state.retryCount) * 1000;
      const timeoutId = window.setTimeout(() => {
        this.setState({
          hasError: false,
          error: undefined,
        });
      }, delay);

      this.retryTimeouts.push(timeoutId);
    }
  };

  render() {
    const { maxRetries = 3 } = this.props;
    const canRetry = this.state.retryCount < maxRetries;

    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            src={this.props.src}
            alt={this.props.alt}
            error={this.state.error}
            retry={this.handleRetry}
            canRetry={canRetry}
          />
        );
      }

      return (
        <DefaultImageErrorFallback
          src={this.props.src}
          alt={this.props.alt}
          error={this.state.error}
          retry={this.handleRetry}
          canRetry={canRetry}
          retryCount={this.state.retryCount}
          maxRetries={maxRetries}
        />
      );
    }

    return this.props.children;
  }
}

interface ImageErrorFallbackProps {
  src?: string;
  alt?: string;
  error?: Error;
  retry: () => void;
  canRetry: boolean;
  retryCount?: number;
  maxRetries?: number;
}

const DefaultImageErrorFallback: React.FC<ImageErrorFallbackProps> = ({
  src,
  alt,
  error,
  retry,
  canRetry,
  retryCount = 0,
  maxRetries = 3,
}) => {
  return (
    <div className="image-error-boundary">
      <div className="error-content">
        <div className="error-icon">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="3"
              y="3"
              width="18"
              height="18"
              rx="2"
              ry="2"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
            <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
            <polyline
              points="21,15 16,10 5,21"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>

        <div className="error-text">
          <p className="error-message">
            {retryCount > 0
              ? "Image still failed to load"
              : "Failed to load image"}
          </p>

          {alt && <p className="image-alt">&ldquo;{alt}&rdquo;</p>}

          {canRetry && (
            <button onClick={retry} className="retry-button">
              Retry ({maxRetries - retryCount} attempts left)
            </button>
          )}

          {!canRetry && (
            <p className="max-retries">Maximum retry attempts reached</p>
          )}
        </div>

        {process.env.NODE_ENV === "development" && (
          <details className="error-details">
            <summary>Debug info</summary>
            <div className="debug-info">
              <p>
                <strong>Source:</strong> {src || "Unknown"}
              </p>
              <p>
                <strong>Retry count:</strong> {retryCount}/{maxRetries}
              </p>
              {error && (
                <p>
                  <strong>Error:</strong> {error.message}
                </p>
              )}
            </div>
          </details>
        )}
      </div>

      <style jsx>{`
        .image-error-boundary {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 200px;
          background: #f8f9fa;
          border: 2px dashed #dee2e6;
          border-radius: 8px;
          padding: 1rem;
          color: #6c757d;
        }

        .error-content {
          text-align: center;
          max-width: 300px;
        }

        .error-icon {
          margin-bottom: 0.5rem;
          opacity: 0.6;
        }

        .error-message {
          margin: 0 0 0.25rem 0;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .image-alt {
          margin: 0 0 0.75rem 0;
          font-size: 0.75rem;
          font-style: italic;
          color: #868e96;
        }

        .retry-button {
          padding: 0.375rem 0.75rem;
          border: 1px solid #007bff;
          border-radius: 4px;
          background: white;
          color: #007bff;
          cursor: pointer;
          font-size: 0.75rem;
          transition: all 0.2s;
        }

        .retry-button:hover {
          background: #007bff;
          color: white;
        }

        .max-retries {
          margin: 0;
          font-size: 0.75rem;
          color: #dc3545;
        }

        .error-details {
          margin-top: 0.75rem;
          text-align: left;
        }

        .error-details summary {
          cursor: pointer;
          font-size: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .debug-info {
          font-size: 0.6875rem;
          line-height: 1.4;
        }

        .debug-info p {
          margin: 0.25rem 0;
          word-break: break-all;
        }

        .debug-info strong {
          color: #495057;
        }
      `}</style>
    </div>
  );
};

export default ImageErrorBoundary;
export type { ImageErrorBoundaryProps, ImageErrorFallbackProps };
