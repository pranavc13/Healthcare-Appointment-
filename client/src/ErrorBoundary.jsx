import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[ErrorBoundary]', error, info);
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-sand-50 dark:bg-brand-950 px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-sand-900 dark:text-white mb-2">Something went wrong</h1>
          <p className="text-sand-500 dark:text-sand-400 text-sm mb-6 leading-relaxed">
            An unexpected error occurred. Try refreshing the page. If the problem persists, please clear your browser cache.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="bg-brand-700 hover:bg-brand-800 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-colors"
            >
              Refresh Page
            </button>
            <a
              href="/"
              className="bg-white dark:bg-brand-900 border border-sand-200 dark:border-brand-800 text-sand-700 dark:text-sand-300 font-medium px-5 py-2.5 rounded-xl text-sm transition-colors hover:bg-sand-50 dark:hover:bg-brand-800"
            >
              Go Home
            </a>
          </div>
          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <details className="mt-6 text-left">
              <summary className="text-xs text-sand-400 cursor-pointer hover:text-sand-600">Show error details</summary>
              <pre className="mt-2 text-xs bg-sand-100 dark:bg-brand-900 text-red-600 p-3 rounded-lg overflow-auto max-h-40">
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
