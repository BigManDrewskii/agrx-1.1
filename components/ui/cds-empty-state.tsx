/**
 * CDSEmptyState — Consistent empty state component
 *
 * Reusable empty state for screens with no data.
 * Provides clear user guidance with optional action button.
 *
 * Usage:
 *   <CDSEmptyState
 *     icon="tray"
 *     title="No trades yet"
 *     message="Start trading to see your history here"
 *     actionLabel="Browse Markets"
 *     onAction={() => router.push('/markets')}
 *   />
 */
import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { CDSButton } from "@/components/ui/cds-button";
import { Title3, Callout } from "@/components/ui/cds-typography";
import { Spacing } from "@/constants/spacing";

export interface CDSEmptyStateProps {
  /** Icon name from IconSymbol */
  icon: string;
  /** Title text */
  title: string;
  /** Descriptive message */
  message: string;
  /** Optional button label */
  actionLabel?: string;
  /** Optional button press handler */
  onAction?: () => void;
  /** Optional container style */
  style?: ViewStyle;
}

export function CDSEmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  style,
}: CDSEmptyStateProps) {
  const colors = useColors();

  return (
    <View style={[styles.container, style]}>
      {/* Icon */}
      <View style={[styles.iconContainer, { backgroundColor: colors.primaryAlpha }]}>
        <IconSymbol name={icon as any} size={48} color={colors.primary} />
      </View>

      {/* Text */}
      <Title3 style={{ color: colors.foreground, textAlign: "center" }}>
        {title}
      </Title3>
      <Callout
        style={{
          color: colors.muted,
          textAlign: "center",
          lineHeight: 21,
        }}
      >
        {message}
      </Callout>

      {/* Action Button */}
      {actionLabel && onAction && (
        <CDSButton
          variant="primary"
          onPress={onAction}
          accessibilityLabel={actionLabel}
          style={styles.actionButton}
        >
          <Callout style={{ fontFamily: 'bold' }}>{actionLabel}</Callout>
        </CDSButton>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing[6],
    minHeight: 400,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing[5],
  },
  actionButton: {
    marginTop: Spacing[6],
  },
});
