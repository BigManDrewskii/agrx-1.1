const { themeColors } = require("./theme.config");
const { Spacing, Radius, Size } = require("./constants/spacing");
const plugin = require("tailwindcss/plugin");

const tailwindColors = Object.fromEntries(
  Object.entries(themeColors).map(([name, swatch]) => [
    name,
    {
      DEFAULT: `var(--color-${name})`,
      light: swatch.light,
      dark: swatch.dark,
    },
  ]),
);

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  // Scan all component and app files for Tailwind classes
  content: ["./app/**/*.{js,ts,tsx}", "./components/**/*.{js,ts,tsx}", "./lib/**/*.{js,ts,tsx}", "./hooks/**/*.{js,ts,tsx}"],

  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: tailwindColors,
      spacing: Spacing,
      borderRadius: Radius,
      fontFamily: {
        sans: ["NotoSans_400Regular"],
        "sans-medium": ["NotoSans_500Medium"],
        "sans-semibold": ["NotoSans_600SemiBold"],
        "sans-bold": ["NotoSans_700Bold"],
        mono: ["GeistMono_400Regular"],
        "mono-medium": ["GeistMono_500Medium"],
        "mono-bold": ["GeistMono_700Bold"],
      },
    },
  },
  plugins: [
    plugin(({ addVariant }) => {
      addVariant("light", ':root:not([data-theme="dark"]) &');
      addVariant("dark", ':root[data-theme="dark"] &');
    }),
  ],
};
