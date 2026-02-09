/**
 * Error Handler Utilities
 *
 * Provides user-friendly error display and reporting utilities.
 */
import { Alert } from "react-native";

export interface ErrorOptions {
  /** Custom title for the error alert */
  title?: string;
  /** Custom error message */
  message?: string;
  /** Optional callback for retry action */
  onRetry?: () => void;
  /** Whether to include error details (development only) */
  includeDetails?: boolean;
}

/**
 * Show a user-friendly error alert with optional retry button
 *
 * @param error - The error object or message
 * @param options - Additional options for displaying the error
 *
 * Usage:
 *   showError(new Error("Network request failed"), {
 *     title: "Connection Error",
 *     onRetry: () => refetch(),
 *   });
 */
export function showError(error: Error | unknown, options: ErrorOptions = {}): void {
  const {
    title = "Something went wrong",
    message,
    onRetry,
    includeDetails = __DEV__,
  } = options;

  // Extract error message
  let errorMessage = message;
  if (!errorMessage) {
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    } else {
      errorMessage = "An unexpected error occurred. Please try again.";
    }
  }

  // Build error details for development
  const details = includeDetails && error instanceof Error ? error.stack : undefined;

  // Define alert buttons - build array dynamically to avoid type inference issues
  const buttons: any[] = [];

  if (onRetry) {
    buttons.push({
      text: "Retry",
      onPress: onRetry,
    });
  }

  if (__DEV__ && details) {
    buttons.push({
      text: "Details",
      onPress: () => {
        Alert.alert("Error Details", details || "No details available", [
          { text: "Copy", onPress: () => console.log(details) },
          { text: "OK" },
        ]);
      },
    });
  }

  buttons.push({ text: "OK", style: "default" });

  // Show the alert
  Alert.alert(title, errorMessage, buttons);
}

/**
 * Get a user-friendly message for common error types
 *
 * @param error - The error object
 * @returns A user-friendly error message
 */
export function getUserFriendlyMessage(error: Error | unknown): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Network errors
    if (message.includes("network") || message.includes("fetch")) {
      return "Unable to connect. Please check your internet connection.";
    }

    // Timeout errors
    if (message.includes("timeout")) {
      return "Request timed out. Please try again.";
    }

    // Authentication errors
    if (message.includes("unauthorized") || message.includes("401")) {
      return "Please log in to continue.";
    }

    // Not found errors
    if (message.includes("not found") || message.includes("404")) {
      return "The requested resource was not found.";
    }

    // Server errors
    if (message.includes("500") || message.includes("502") || message.includes("503")) {
      return "Server is experiencing issues. Please try again later.";
    }
  }

  return "An unexpected error occurred. Please try again.";
}

/**
 * Log error to console with context (development only)
 *
 * @param error - The error object
 * @param context - Additional context about where the error occurred
 */
export function logError(error: Error | unknown, context: string): void {
  if (__DEV__) {
    console.error(`[Error] ${context}:`, error);
  }
}
