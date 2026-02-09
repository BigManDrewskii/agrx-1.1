import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Platform } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { useThemeContext } from "@/lib/theme-provider";
import { FontFamily } from "@/constants/typography";
import { Spacing, Radius } from "@/constants/spacing";

export default function TabLayout() {
  const colors = useColors();
  const { colorScheme } = useThemeContext();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 56 + bottomPadding;

  return (
    <Tabs
      key={`tabs-${colorScheme}`}
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.muted,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: FontFamily.semibold,
          letterSpacing: 0.2,
        },
        tabBarStyle: {
          // Floating container margins
          marginHorizontal: Spacing[3], // 12px horizontal margin
          marginBottom: Spacing[2], // 8px vertical margin

          // Dimensions
          height: 60, // Increased from 56
          paddingTop: Spacing[2], // 8px (was hardcoded)
          paddingBottom: bottomPadding,

          // Styling
          backgroundColor: colors.surface,
          borderTopWidth: 0, // Remove border
          borderRadius: Radius[500], // 24px corners

          // Shadow for floating effect
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
          elevation: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="markets"
        options={{
          title: "Markets",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="chart.line.uptrend.xyaxis" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="trade"
        options={{
          title: "",
          tabBarIcon: () => (
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: Radius[500],
                alignItems: "center",
                justifyContent: "center",
                marginTop: -16,
                backgroundColor: colors.primary,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
                elevation: 10,
              }}
            >
              <IconSymbol size={32} name="plus.circle.fill" color={colors.onPrimary} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{
          title: "Portfolio",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="briefcase.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          title: "Social",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="person.2.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
