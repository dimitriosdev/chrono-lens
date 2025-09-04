"use client";

import React from "react";

interface SlideshowErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface SlideshowErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{
    error?: Error;
    resetError: () => void;
  }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

class SlideshowErrorBoundary extends React.Component<
  SlideshowErrorBoundaryProps,
  SlideshowErrorBoundaryState
> {
  constructor(props: SlideshowErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): SlideshowErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error for debugging
    console.error(
      "Slideshow Error Boundary caught an error:",
      error,
      errorInfo
    );

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback component
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error}
            resetError={this.handleReset}
          />
        );
      }

      // Default error UI
      return (
        <DefaultSlideshowErrorFallback
          error={this.state.error}
          resetError={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error;
  resetError: () => void;
}

const DefaultSlideshowErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
}) => {
  return (
    <div className="slideshow-error-boundary">
      <div className="error-content">
        <div className="error-icon">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
            <path d="M15 9l-6 6" stroke="currentColor" strokeWidth="2" />
            <path d="M9 9l6 6" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
        <h3>Slideshow Error</h3>
        <p>Something went wrong while displaying the slideshow.</p>
        {process.env.NODE_ENV === "development" && error && (
          <details className="error-details">
            <summary>Error details (development)</summary>
            <pre>{error.message}</pre>
            {error.stack && <pre>{error.stack}</pre>}
          </details>
        )}
        <div className="error-actions">
          <button onClick={resetError} className="retry-button">
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="reload-button"
          >
            Reload Page
          </button>
        </div>
      </div>

      <style jsx>{`
        .slideshow-error-boundary {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 2rem;
        }

        .error-content {
          text-align: center;
          max-width: 400px;
        }

        .error-icon {
          color: #dc3545;
          margin-bottom: 1rem;
        }

        .error-content h3 {
          margin: 0 0 0.5rem 0;
          color: #343a40;
          font-size: 1.25rem;
        }

        .error-content p {
          margin: 0 0 1rem 0;
          color: #6c757d;
        }

        .error-details {
          text-align: left;
          margin: 1rem 0;
          padding: 1rem;
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 4px;
        }

        .error-details summary {
          cursor: pointer;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        .error-details pre {
          margin: 0.5rem 0 0 0;
          font-size: 0.875rem;
          white-space: pre-wrap;
          word-wrap: break-word;
        }

        .error-actions {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
        }

        .retry-button,
        .reload-button {
          padding: 0.5rem 1rem;
          border: 1px solid #007bff;
          border-radius: 4px;
          background: white;
          color: #007bff;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s;
        }

        .retry-button:hover,
        .reload-button:hover {
          background: #007bff;
          color: white;
        }

        .reload-button {
          border-color: #6c757d;
          color: #6c757d;
        }

        .reload-button:hover {
          background: #6c757d;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default SlideshowErrorBoundary;
export type { SlideshowErrorBoundaryProps, ErrorFallbackProps };
