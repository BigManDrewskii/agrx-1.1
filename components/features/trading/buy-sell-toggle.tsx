/**
 * BuySellToggle — Buy/Sell toggle switch
 *
 * Two-button toggle for selecting buy or sell mode using CDSSegmentedTabs.
 * Active state shows success color for buy, error color for sell.
 *
 * Usage:
 *   <BuySellToggle
 *     isBuy={true}
 *     onChange={(isBuy) => setIsBuy(isBuy)}
 *   />
 */
import React from "react";
import { View, StyleSheet } from "react-native";
import { CDSSegmentedTabs } from "@/components/ui/cds-segmented-tabs";
import { Spacing } from "@/constants/spacing";

interface BuySellToggleProps {
  isBuy: boolean;
  onChange: (isBuy: boolean) => void;
}

export function BuySellToggle({ isBuy, onChange }: BuySellToggleProps) {
  return (
    <View style={styles.container}>
      <CDSSegmentedTabs
        options={["Buy", "Sell"]}
        selected={isBuy ? 0 : 1}
        onChange={(index) => onChange(index === 0)}
        colorType={isBuy ? "success" : "error"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing[4],
    marginBottom: Spacing[3],
    marginTop: Spacing[2],
  },
});
