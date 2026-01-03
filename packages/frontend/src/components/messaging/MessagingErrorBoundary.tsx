'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Error Boundary für Messaging-Widget
 * Verhindert, dass Fehler im Messaging-Widget die gesamte App crashen
 */
export class MessagingErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('[Messaging] Error Boundary caught:', error, errorInfo);
    // Optional: Error Reporting (Sentry, etc.)
  }

  render() {
    if (this.state.hasError) {
      // Widget ausblenden bei Fehler (Graceful Degradation)
      return this.props.fallback || null;
    }

    return this.props.children;
  }
}

