/**
 * ErrorBoundary — Catches React errors and displays user-friendly fallback UI
 *
 * Wraps any part of the component tree to catch JavaScript errors anywhere in the
 * child component tree, log those errors, and display a fallback UI instead of
 * crashing the entire app.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <YourComponent />
 *   </ErrorBoundary>
 *
 * With custom fallback:
 *   <ErrorBoundary
 *     fallback={<CustomErrorScreen />}
 *     onError={(error, errorInfo) => console.log('Error:', error)}
 *   >
 *     <YourComponent />
 *   </ErrorBoundary>
 */
import React, { Component, ErrorInfo, ReactNode } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { CDSButton } from "@/components/ui/cds-button";
import { LargeTitle, Title3, Subhead, Caption1 } from "@/components/ui/typography";
import { useColors } from "@/hooks/use-colors";
import { Spacing, Radius } from "@/constants/spacing";

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Custom fallback component to render on error */
  fallback?: ReactNode;
  /** Callback called when error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Custom message to display */
  message?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundaryInner — Uses useColors() hook
 *
 * Split into inner component to safely use hooks within ErrorBoundary class component.
 */
function ErrorBoundaryInner({
  error,
  onReset,
  message,
}: {
  error: Error | null;
  onReset: () => void;
  message?: string;
}) {
  const colors = useColors();

  const handleReportBug = () => {
    Alert.alert(
      "Report Bug",
      "Please contact support with the following error details:\n\n" + error?.message || "Unknown error",
      [{ text: "OK", style: "default" }]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Error Icon */}
        <View style={[styles.iconContainer, { backgroundColor: colors.error + "1A" }]}>
          <Subhead style={{ fontSize: 48, color: colors.error }}>⚠️</Subhead>
        </View>

        {/* Error Title */}
        <LargeTitle style={{ color: colors.foreground, textAlign: "center" }}>
          Something went wrong
        </LargeTitle>

        {/* Error Message */}
        <Title3 style={{ color: colors.muted, textAlign: "center", marginTop: Spacing[3] }}>
          {message || "An unexpected error occurred. Don't worry, your data is safe."}
        </Title3>

        {/* Error Details (Development Only) */}
        {__DEV__ && error && (
          <View style={[styles.errorDetails, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Caption1 color="muted" style={{ fontFamily: "monospace", fontSize: 11 }}>
              {error.toString()}
            </Caption1>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <CDSButton
            variant="primary"
            onPress={onReset}
            style={styles.button}
            accessibilityLabel="Try again"
          >
            Try Again
          </CDSButton>
          {__DEV__ && (
            <CDSButton
              variant="tertiary"
              onPress={handleReportBug}
              style={styles.button}
              accessibilityLabel="Report bug"
            >
              Report Bug
            </CDSButton>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (__DEV__) {
      console.error("[ErrorBoundary] Caught error:", error);
      console.error("[ErrorBoundary] Component stack:", errorInfo.componentStack);
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Use default error UI
      return (
        <ErrorBoundaryInner
          error={this.state.error}
          onReset={this.handleReset}
          message={this.props.message}
        />
      );
    }

    return this.props.children;
  }
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing[6],
    paddingBottom: 100,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing[6],
  },
  errorDetails: {
    marginTop: Spacing[4],
    padding: Spacing[4],
    borderRadius: Radius[300],
    borderWidth: 1,
    width: "100%",
  },
  buttonContainer: {
    width: "100%",
    marginTop: Spacing[6],
    gap: Spacing[3],
  },
  button: {
    width: "100%",
  },
});
