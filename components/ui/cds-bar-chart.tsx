/**
 * CDSBarChart — Enhanced bar chart following CDS chart design patterns
 *
 * Clean bar chart with CDS color palette and proper spacing.
 * Perfect for volume, portfolio allocation, and category breakdowns.
 *
 * Usage:
 *   <CDSBarChart
 *     data={[100, 150, 80, 200, 120]}
 *     height={180}
 *     color="primary"
 *   />
 */
import React, { useMemo, useState } from "react";
import { View, StyleSheet, LayoutChangeEvent } from "react-native";
import Svg, { Rect, Defs, LinearGradient, Stop, Line } from "react-native-svg";
import { useColors } from "@/hooks/use-colors";
import { Spacing, Radius } from "@/constants/spacing";

type BarColor = "primary" | "success" | "error" | "gold" | "muted";

interface CDSBarChartProps {
  data: number[];
  /** Chart width - undefined fills container (responsive) */
  width?: number;
  /** Chart height - maintains aspect ratio */
  height?: number;
  color?: BarColor;
  /** Spacing between bars (default: Spacing[1] = 4px) */
  barSpacing?: number;
  /** Border radius of bars (default: Radius[100] = 4px) */
  borderRadius?: number;
  /** Whether to show gradient fill */
  showGradient?: boolean;
  /** Maximum value for y-axis (auto-calculated if not provided) */
  maxValue?: number;
}

const DEFAULT_PADDING = {
  top: Spacing[5],    // 20px
  right: Spacing[5],  // 20px
  bottom: Spacing[6], // 24px
  left: Spacing[12],  // 48px
};

export function CDSBarChart({
  data,
  width: propWidth,
  height = 180,
  color = "primary",
  barSpacing = Spacing[1], // 4px
  borderRadius = Radius[100], // 4px
  showGradient = true,
  maxValue,
}: CDSBarChartProps) {
  const colors = useColors();
  const [measuredWidth, setMeasuredWidth] = useState<number | undefined>(propWidth);

  const handleLayout = (event: LayoutChangeEvent) => {
    if (propWidth === undefined) {
      const { width } = event.nativeEvent.layout;
      setMeasuredWidth(width);
    }
  };

  const chartData = useMemo(() => {
    const width = propWidth ?? measuredWidth;
    if (!data || data.length === 0) return null;
    if (width === undefined) return null;

    const maxVal = maxValue !== undefined ? maxValue : Math.max(...data);
    const minVal = Math.min(...data);
    const range = maxVal - (minVal < 0 ? minVal : 0) || 1;

    const padding = DEFAULT_PADDING;
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const barWidth = (chartWidth - barSpacing * (data.length - 1)) / data.length;

    const getColor = (): string => {
      switch (color) {
        case "primary":
          return colors.primary;
        case "success":
          return colors.success;
        case "error":
          return colors.error;
        case "gold":
          return colors.gold;
        case "muted":
          return colors.muted;
        default:
          return colors.primary;
      }
    };

    const barColor = getColor();

    const bars = data.map((value, index) => {
      const barHeight = (Math.abs(value) / range) * chartHeight;
      const x = padding.left + index * (barWidth + barSpacing);
      const y = padding.top + chartHeight - barHeight;

      return {
        x,
        y,
        width: Math.max(barWidth, 2),
        height: Math.max(barHeight, 2),
        value,
      };
    });

    return { bars, padding, barColor, chartHeight };
  }, [data, propWidth, measuredWidth, height, color, maxValue, barSpacing, colors]);

  if (!chartData) return null;

  const { bars, padding, barColor, chartHeight } = chartData;
  const finalWidth = propWidth ?? measuredWidth;

  return (
    <View style={{ width: propWidth ?? '100%', height }} onLayout={handleLayout}>
      <Svg width={finalWidth} height={height}>
        <Defs>
          <LinearGradient id={`bar-gradient-${barColor}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={barColor} stopOpacity={1} />
            <Stop offset="100%" stopColor={barColor} stopOpacity={showGradient ? 0.6 : 1} />
          </LinearGradient>
        </Defs>

        {/* Bars */}
        {bars.map((bar, i) => (
          <Rect
            key={i}
            x={bar.x}
            y={bar.y}
            width={bar.width}
            height={bar.height}
            fill={showGradient ? `url(#bar-gradient-${barColor})` : barColor}
            rx={borderRadius}
            ry={borderRadius}
          />
        ))}

        {/* Base line */}
        <Line
          x1={padding.left}
          y1={padding.top + chartHeight}
          x2={finalWidth! - padding.right}
          y2={padding.top + chartHeight}
          stroke={colors.border}
          strokeWidth={1}
        />
      </Svg>
    </View>
  );
}
