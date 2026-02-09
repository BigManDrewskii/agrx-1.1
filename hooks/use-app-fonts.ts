/**
 * Font loading hook for AGRX.
 *
 * Loads Noto Sans (Regular, Medium, SemiBold, Bold) with Greek support
 * and Geist Mono (Regular, Medium, Bold) via expo-google-fonts.
 *
 * Usage in root layout:
 *   const [fontsLoaded, fontError] = useAppFonts();
 *   if (!fontsLoaded && !fontError) return null; // hold splash
 */
import { useFonts } from "expo-font";
import {
  NotoSans_400Regular,
  NotoSans_500Medium,
  NotoSans_600SemiBold,
  NotoSans_700Bold,
} from "@expo-google-fonts/noto-sans";
import {
  GeistMono_400Regular,
  GeistMono_500Medium,
  GeistMono_700Bold,
} from "@expo-google-fonts/geist-mono";

export function useAppFonts() {
  return useFonts({
    // Noto Sans - expo-google-fonts pattern with Greek support
    NotoSans_400Regular,
    NotoSans_500Medium,
    NotoSans_600SemiBold,
    NotoSans_700Bold,

    // Geist Mono - expo-google-fonts pattern
    GeistMono_400Regular,
    GeistMono_500Medium,
    GeistMono_700Bold,
  });
}
