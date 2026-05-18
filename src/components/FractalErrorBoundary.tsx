import { Component, type ErrorInfo, type ReactNode } from 'react';

interface FractalErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface FractalErrorBoundaryState {
  hasError: boolean;
}

export class FractalErrorBoundary extends Component<FractalErrorBoundaryProps, FractalErrorBoundaryState> {
  override state: FractalErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): FractalErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('El render fractal falló dentro de React.', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  override componentDidUpdate(previousProps: FractalErrorBoundaryProps) {
    if (previousProps.children !== this.props.children && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }

    return this.props.children;
  }
}
