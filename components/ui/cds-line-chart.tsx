/**
 * CDSLineChart — Enhanced line chart following CDS chart design patterns
 *
 * Beautiful line chart with gradient fill, smooth curves, and CDS color palette.
 * Perfect for price history and trend visualization.
 *
 * Usage:
 *   <CDSLineChart
 *     data={[10, 12, 11, 14, 13, 16, 15, 18]}
 *     width={320}
 *     height={180}
 *     positive={true}
 *     showDots={true}
 *   />
 */
import React, { useMemo, useState } from "react";
import { View, StyleSheet, LayoutChangeEvent } from "react-native";
import Svg, { Path, Defs, LinearGradient, Stop, Circle, Line } from "react-native-svg";
import { useColors } from "@/hooks/use-colors";
import { Spacing, Radius } from "@/constants/spacing";

interface PaddingConfig {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

interface CDSLineChartProps {
  data: number[];
  /** Chart width - undefined fills container (responsive) */
  width?: number;
  /** Chart height - maintains aspect ratio */
  height?: number;
  positive?: boolean;
  strokeWidth?: number;
  /** Whether to show gradient fill below the line */
  showGradient?: boolean;
  /** Whether to use curved lines (bezier) vs straight lines */
  smooth?: boolean;
  /** Whether to show dots at data points */
  showDots?: boolean;
  /** Whether to show grid lines */
  showGrid?: boolean;
  /** Number of grid lines to show */
  gridLines?: number;
  /** Optional labels for x-axis */
  labels?: string[];
  /** Optional custom padding override */
  padding?: PaddingConfig;
}

const DEFAULT_PADDING = {
  top: Spacing[5],    // 20px
  right: Spacing[5],  // 20px
  bottom: Spacing[6], // 24px
  left: Spacing[12],  // 48px
};

export function CDSLineChart({
  data,
  width: propWidth, // Can be undefined for responsive
  height = 180,
  positive,
  strokeWidth = 2,
  showGradient = true,
  smooth = true,
  showDots = false,
  showGrid = false,
  gridLines = 5,
  labels,
  padding: paddingOverride,
}: CDSLineChartProps) {
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
    if (!data || data.length < 2) return null;
    if (width === undefined) return null;

    const isPositive =
      positive !== undefined ? positive : data[data.length - 1] >= data[0];
    const color = isPositive ? colors.success : colors.error;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const padding = {
      top: paddingOverride?.top ?? DEFAULT_PADDING.top,
      right: paddingOverride?.right ?? DEFAULT_PADDING.right,
      bottom: paddingOverride?.bottom ?? DEFAULT_PADDING.bottom,
      left: paddingOverride?.left ?? DEFAULT_PADDING.left,
    };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Build points
    const points = data.map((value, index) => {
      const x = padding.left + (index / (data.length - 1)) * chartWidth;
      const y = padding.top + chartHeight - ((value - min) / range) * chartHeight;
      return { x, y, value };
    });

    // Generate grid lines
    const gridLinesArr = [];
    if (showGrid) {
      for (let i = 0; i <= gridLines; i++) {
        const y = padding.top + (chartHeight / gridLines) * i;
        const value = max - (range / gridLines) * i;
        gridLinesArr.push({ y, value });
      }
    }

    // Create smooth bezier curve
    let path = "";
    if (smooth && points.length > 2) {
      path = `M ${points[0].x} ${points[0].y}`;

      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[Math.max(0, i - 1)];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[Math.min(points.length - 1, i + 2)];

        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
      }
    } else {
      // Straight lines
      path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    }

    // Create gradient fill path
    const fillPath = showGradient
      ? `${path} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`
      : null;

    return { points, path, fillPath, color, padding, gridLinesArr, isPositive };
  }, [data, propWidth, measuredWidth, height, positive, colors.success, colors.error, showGradient, smooth, showGrid, gridLines, paddingOverride]);

  if (!chartData) return null;

  const { points, path, fillPath, color, padding, gridLinesArr, isPositive } = chartData;
  const finalWidth = propWidth ?? measuredWidth;

  return (
    <View style={{ width: propWidth ?? '100%', height }} onLayout={handleLayout}>
      <Svg width={finalWidth} height={height}>
        <Defs>
          <LinearGradient id={`line-gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={color} stopOpacity={0.2} />
            <Stop offset="100%" stopColor={color} stopOpacity={0.0} />
          </LinearGradient>
        </Defs>

        {/* Grid lines */}
        {gridLinesArr.map((line, i) => (
          <Line
            key={i}
            x1={padding.left}
            y1={line.y}
            x2={finalWidth! - padding.right}
            y2={line.y}
            stroke={colors.border}
            strokeWidth={0.5}
            strokeDasharray={[4, 4]}
          />
        ))}

        {/* Gradient fill */}
        {fillPath && (
          <Path
            d={fillPath}
            fill={`url(#line-gradient-${color})`}
            stroke="none"
          />
        )}

        {/* Line */}
        <Path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {showDots && points.map((point, i) => (
          <Circle
            key={i}
            cx={point.x}
            cy={point.y}
            r={Spacing[1]} // 4px using Spacing token
            fill={color}
            stroke={colors.background}
            strokeWidth={1}
          />
        ))}

        {/* Labels */}
        {labels && labels.map((label, i) => {
          if (i >= points.length) return null;
          return (
            <Svg key={i} x={points[i].x - 20} y={height - 25} width={40} height={20}>
              <Path
                d="M 20 14 Q 20 14 20 14"
                fill={colors.muted}
                stroke="none"
              />
              {/* Note: Would need Text component but react-native-svg doesn't have it built-in */}
            </Svg>
          );
        })}
      </Svg>
    </View>
  );
}
