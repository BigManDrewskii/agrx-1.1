# AGRX Chart Components

Professional chart components following Coinbase Design System (CDS) patterns and AGRX design tokens.

## Overview

All chart components use:
- **4px spacing grid** via `Spacing` tokens
- **CDS border radius** via `Radius` tokens
- **Theme-aware colors** via `useColors()` hook
- **Responsive design** - charts fill container width by default
- **React Native SVG** for vector rendering

---

## Components

### CDSLineChart

Professional line chart with gradient fill, smooth curves, and grid lines.

**Best for**: Price history, trends, time-series data

```tsx
import { CDSLineChart } from '@/components/ui/cds-line-chart';

<CDSLineChart
  data={[10, 12, 11, 14, 13, 16, 15, 18]}
  height={200}
  positive={true}
  showGradient={true}
  smooth={true}
  showDots={false}
  showGrid={true}
  gridLines={5}
/>
```

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `number[]` | **required** | Data points to plot |
| `width` | `number` | `undefined` | Chart width (undefined = responsive) |
| `height` | `number` | `180` | Chart height in pixels |
| `positive` | `boolean` | auto | Color scheme (true=green, false=red) |
| `strokeWidth` | `number` | `2` | Line thickness in pixels |
| `showGradient` | `boolean` | `true` | Show gradient fill below line |
| `smooth` | `boolean` | `true` | Use bezier curves vs straight lines |
| `showDots` | `boolean` | `false` | Show dots at data points |
| `showGrid` | `boolean` | `false` | Show horizontal grid lines |
| `gridLines` | `number` | `5` | Number of grid lines |
| `labels` | `string[]` | `undefined` | X-axis labels (experimental) |
| `padding` | `PaddingConfig` | `DEFAULT_PADDING` | Custom padding override |

**Default Padding**:
```tsx
const DEFAULT_PADDING = {
  top: Spacing[5],    // 20px
  right: Spacing[5],  // 20px
  bottom: Spacing[6], // 24px
  left: Spacing[12],  // 48px
};
```

---

### CDSBarChart

Clean bar chart with gradient fills and rounded corners.

**Best for**: Volume charts, portfolio allocation, category breakdowns

```tsx
import { CDSBarChart } from '@/components/ui/cds-bar-chart';

<CDSBarChart
  data={[100, 150, 80, 200, 120]}
  height={180}
  color="primary"
  showGradient={true}
/>
```

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `number[]` | **required** | Data points to plot |
| `width` | `number` | `undefined` | Chart width (undefined = responsive) |
| `height` | `number` | `180` | Chart height in pixels |
| `color` | `BarColor` | `"primary"` | Bar color scheme |
| `barSpacing` | `number` | `Spacing[1]` (4px) | Space between bars |
| `borderRadius` | `number` | `Radius[100]` (4px) | Corner radius of bars |
| `showGradient` | `boolean` | `true` | Show vertical gradient |
| `maxValue` | `number` | auto | Y-axis maximum value |

**Bar Colors**:
- `"primary"` - Brand blue (default)
- `"success"` - Green (positive)
- `"error"` - Red (negative)
- `"gold"` - Gold (leaderboard ranks)
- `"muted"` - Gray (secondary)

---

### CDSSparkline

Mini sparkline chart for tight spaces.

**Best for**: Asset rows, watchlists, portfolio cards

```tsx
import { CDSSparkline } from '@/components/ui/cds-sparkline';

<CDSSparkline
  data={[10, 12, 11, 14, 13, 16]}
  width={60}
  height={28}
  positive={true}
/>
```

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `number[]` | **required** | Data points to plot |
| `width` | `number` | `60` | Chart width in pixels |
| `height` | `number` | `28` | Chart height in pixels |
| `positive` | `boolean` | auto | Color scheme |
| `strokeWidth` | `number` | `1.5` | Line thickness (thinner for mini) |
| `showGradient` | `boolean` | `true` | Show gradient fill |
| `smooth` | `boolean` | `true` | Use bezier curves |

**Design Notes**:
- `strokeWidth` is 1.5px (thinner than line charts) for better visibility at small sizes
- Padding uses `Spacing[1] / 2` (2px) for tight spacing in mini charts
- Gradient opacity is higher (0.3) for visibility at small sizes

---

## Responsive Usage

### Fill Container Width (Recommended)

Charts are responsive by default - omit `width` prop to fill container:

```tsx
<View style={styles.chartContainer}>
  <CDSLineChart
    data={chartData}
    height={200}
    // width omitted - fills container
  />
</View>

// StyleSheet
chartContainer: {
  width: '100%',
  paddingHorizontal: Spacing[4], // 16px
}
```

### Fixed Width (Not Recommended)

Only use fixed width when you absolutely need it:

```tsx
<CDSLineChart
  data={chartData}
  width={320}
  height={200}
/>
```

---

## Spacing Guidelines

### 4px Grid Compliance

All spacing MUST use `Spacing` tokens:

| Token | Value | Usage |
|-------|-------|-------|
| `Spacing[0]` | 0px | No spacing |
| `Spacing[1]` | 4px | Tiny gap |
| `Spacing[2]` | 8px | Small gap |
| `Spacing[3]` | 12px | Medium gap |
| `Spacing[4]` | 16px | Standard padding |
| `Spacing[5]` | 20px | Comfortable padding |
| `Spacing[6]` | 24px | Generous padding |
| `Spacing[8]` | 32px | Large spacing |
| `Spacing[12]` | 48px | Extra large |

### Chart Padding Patterns

**Line/Bar Charts** (Standard):
- Top: `Spacing[5]` (20px) - Room for grid labels
- Right: `Spacing[5]` (20px) - Breathing room
- Bottom: `Spacing[6]` (24px) - X-axis labels
- Left: `Spacing[12]` (48px) - Y-axis labels

**Sparklines** (Mini):
- All: `Spacing[1] / 2` (2px) - Minimal for tight spaces

---

## Border Radius Guidelines

Use `Radius` tokens for consistency:

| Token | Value | Usage |
|-------|-------|-------|
| `Radius[100]` | 4px | Subtle rounding (bars) |
| `Radius[200]` | 8px | Small rounding (pills) |
| `Radius[300]` | 12px | Medium rounding |
| `Radius[400]` | 16px | Large rounding (cards) |
| `Radius[500]` | 24px | Extra large (sheets) |

---

## Theme Colors

Charts use `useColors()` for theme-aware coloring:

```tsx
const colors = useColors();

// Automatic color selection
const color = isPositive ? colors.success : colors.error;

// Available colors
colors.primary        // Brand blue
colors.success        // Green (positive)
colors.error          // Red (negative)
colors.warning        // Amber
colors.gold           // Gold
colors.muted          // Gray
colors.background     // Page bg
colors.surface        // Card bg
colors.foreground     // Primary text
colors.border         // Border/divider
```

---

## Performance

### Memoization

All charts use `useMemo` for expensive calculations:

```tsx
const chartData = useMemo(() => {
  // Expensive path calculations
}, [data, width, height, ...]);
```

### Do's and Don'ts

✅ **DO**:
- Pass stable data arrays (no inline arrays)
- Let charts handle their own memoization
- Use responsive width (undefined) for flexibility

❌ **DON'T**:
- Pass inline arrays: `data={[1,2,3]}` on every render
- Disable memoization unless profiling shows it's needed
- Use fixed widths unless absolutely necessary

---

## Accessibility

### Color Independence

Charts use shape + color for accessibility:
- **Positive trend**: Upward direction + green fill
- **Negative trend**: Downward direction + red fill

### Screen Readers

Charts use `View` with `accessible={true}`. Consider adding:
- `accessibilityLabel` - Chart description
- `accessibilityHint` - Interaction hint (if interactive)

---

## Examples

### Asset Detail Screen

```tsx
<View style={styles.chartContainer}>
  <CDSLineChart
    data={chartData}
    height={200}
    positive={stock.change >= 0}
    showGradient={true}
    smooth={true}
    showGrid={true}
    gridLines={5}
  />
</View>

const styles = StyleSheet.create({
  chartContainer: {
    width: '100%',
    paddingHorizontal: Spacing[4],
  },
});
```

### Portfolio Card Sparkline

```tsx
<View style={styles.row}>
  <View>
    <Title3>OPAP</Title3>
    <Caption1>+2.4%</Caption1>
  </View>
  <CDSSparkline
    data={sparklineData}
    width={80}
    height={32}
    positive={true}
  />
</View>
```

### Volume Bar Chart

```tsx
<CDSBarChart
  data={volumeData}
  height={120}
  color="primary"
  showGradient={true}
/>
```

---

## Troubleshooting

### Chart Not Rendering

**Problem**: Chart doesn't appear
**Solution**: Check that:
- Data array has 2+ elements
- Width is not `undefined` on first render (use responsive layout)

### Spacing Issues

**Problem**: Visual spacing looks off
**Solution**:
- Verify all spacing uses `Spacing` tokens
- Check container has proper padding
- Ensure `paddingHorizontal` on container

### Performance Issues

**Problem**: Charts lag during scroll
**Solution**:
- Reduce data point count
- Disable smooth curves: `smooth={false}`
- Use simpler charts (sparkline vs full chart)

---

## Future Enhancements

Potential additions:
- `CDSCandlestickChart` - Intraday trading (Pro feature)
- `CDSAreaChart` - Portfolio performance (filled)
- `CDSVolumeChart` - Volume with price overlay
- `CDSComboChart` - Price + volume combination
- Touch interaction for data point inspection
- Animated transitions for data changes
