/**
 * AvatarSettingsSection — Avatar management section for settings
 *
 * Allows users to:
 * - View current avatar (uploaded, FaceHash, or default)
 * - Upload a new image from camera roll
 * - Toggle FaceHash avatar generation on/off
 * - Preview their FaceHash avatar inline
 * - Remove custom avatar
 *
 * FaceHash integration:
 *   Uses the hosted API at https://www.facehash.dev/api/avatar
 *   Same input string = same face, always. No randomness.
 */
import React, { useState, useMemo } from "react";
import { View, Image, StyleSheet, Alert, Platform, Linking } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import { Avatar } from "@/components/ui/avatar";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Switch } from "react-native";
import {
  Subhead,
  Caption1,
  Caption2,
} from "@/components/ui/typography";
import { Footnote } from "@/components/ui/cds-typography";
import { FontFamily } from "@/constants/typography";
import { Spacing, Radius } from "@/constants/spacing";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { useColors, colorAlpha } from "@/hooks/use-colors";
import { useThemeContext } from "@/lib/theme-provider";

/** Base URL for the FaceHash hosted avatar API */
const FACEHASH_API = "https://www.facehash.dev/api/avatar";

interface AvatarSettingsSectionProps {
  isLast?: boolean;
}

export function AvatarSettingsSection({ isLast = false }: AvatarSettingsSectionProps) {
  const colors = useColors();
  const { colorScheme } = useThemeContext();
  const isDark = colorScheme === "dark";
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const [isUploading, setIsUploading] = useState(false);

  // Build FaceHash preview URL for the current user
  const faceHashPreviewUrl = useMemo(() => {
    if (!user) return null;
    const seed = user.email || user.name;
    if (!seed) return null;
    const params = new URLSearchParams({
      name: seed,
      size: "128",
      variant: "gradient",
      showInitial: "true",
    });
    return `${FACEHASH_API}?${params.toString()}`;
  }, [user]);

  // Mutations
  const uploadAvatar = trpc.users.uploadAvatar.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      Alert.alert("Success", "Avatar updated successfully");
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to upload avatar");
    },
  });

  const updateAvatarPreferences = trpc.users.updateAvatarPreferences.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
    },
  });

  const removeAvatar = trpc.users.removeAvatar.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      Alert.alert("Success", "Avatar removed");
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to remove avatar");
    },
  });

  // Handlers
  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        if (!asset.base64) {
          Alert.alert("Error", "Unable to process image");
          return;
        }

        setIsUploading(true);
        await uploadAvatar.mutateAsync({
          imageData: `data:image/jpeg;base64,${asset.base64}`,
          contentType: "image/jpeg",
        });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleToggleFaceHash = async (value: boolean) => {
    try {
      await updateAvatarPreferences.mutateAsync({ useFaceHash: value });
    } catch (error) {
      Alert.alert("Error", "Failed to update preferences");
    }
  };

  const handleRemoveAvatar = () => {
    if (!user?.avatarUrl) return;

    Alert.alert(
      "Remove Avatar",
      "Are you sure you want to remove your custom avatar? Your FaceHash avatar will be shown instead.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => removeAvatar.mutate(),
        },
      ]
    );
  };

  const handleOpenFaceHash = () => {
    Linking.openURL("https://www.facehash.dev/");
  };

  if (!user) return null;

  const isFaceHashActive = user.useFaceHash && !user.avatarUrl;

  return (
    <View
      style={[
        styles.container,
        !isLast && {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
      ]}
    >
      {/* Current Avatar Display */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarInfo}>
          <Subhead style={{ fontFamily: FontFamily.medium }}>Profile Avatar</Subhead>
          <Caption1 color="muted" style={{ marginTop: 2 }}>
            {user.avatarUrl
              ? "Custom avatar uploaded"
              : user.useFaceHash
              ? "Generated by FaceHash"
              : "Using default avatar"}
          </Caption1>
        </View>
        <Avatar user={user} size="xl" />
      </View>

      {/* Upload Button */}
      <AnimatedPressable
        variant="card"
        onPress={handlePickImage}
        disabled={isUploading}
        style={[
          styles.actionButton,
          {
            backgroundColor: colors.foregroundAlpha4,
            borderColor: colors.foregroundAlpha8,
            opacity: isUploading ? 0.5 : 1,
          },
        ]}
      >
        <IconSymbol name="photo" size={18} color={colors.primary} />
        <Subhead style={{ fontFamily: FontFamily.medium, color: colors.primary, marginLeft: Spacing[2] }}>
          {isUploading ? "Uploading..." : "Upload New Photo"}
        </Subhead>
      </AnimatedPressable>

      {/* FaceHash Toggle */}
      <View style={styles.faceHashSection}>
        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <View style={styles.faceHashLabel}>
              <Subhead style={{ fontFamily: FontFamily.medium }}>Use FaceHash</Subhead>
              <AnimatedPressable
                variant="icon"
                onPress={handleOpenFaceHash}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <IconSymbol name="arrow.up.right.square" size={14} color={colors.muted} />
              </AnimatedPressable>
            </View>
            <Caption1 color="muted" style={{ marginTop: 2 }}>
              Generate a unique avatar from your email
            </Caption1>
          </View>
          <Switch
            value={user.useFaceHash}
            onValueChange={handleToggleFaceHash}
            trackColor={{
              false: colors.surfaceSecondary,
              true: colors.primary,
            }}
            thumbColor={Platform.OS === "android" ? colors.onPrimary : undefined}
            ios_backgroundColor={colors.surfaceSecondary}
          />
        </View>

        {/* FaceHash Preview (shown when FaceHash is enabled) */}
        {user.useFaceHash && faceHashPreviewUrl && (
          <View
            style={[
              styles.faceHashPreview,
              {
                backgroundColor: isDark
                  ? colorAlpha(colors.primary, 0.06)
                  : colorAlpha(colors.primary, 0.04),
                borderColor: isDark
                  ? colorAlpha(colors.primary, 0.12)
                  : colorAlpha(colors.primary, 0.08),
              },
            ]}
          >
            <Image
              source={{ uri: faceHashPreviewUrl }}
              style={styles.previewImage}
              resizeMode="cover"
            />
            <View style={styles.previewText}>
              <Footnote style={{ fontFamily: FontFamily.medium, color: colors.foreground }}>
                Your FaceHash
              </Footnote>
              <Caption2 color="muted" style={{ marginTop: 1 }}>
                Deterministic — same email, same face
              </Caption2>
            </View>
          </View>
        )}
      </View>

      {/* Remove Button (only show if custom avatar exists) */}
      {user.avatarUrl && (
        <AnimatedPressable
          variant="card"
          onPress={handleRemoveAvatar}
          style={styles.removeButton}
        >
          <IconSymbol name="trash" size={16} color={colors.error} />
          <Subhead style={{ fontFamily: FontFamily.medium, color: colors.error, marginLeft: Spacing[2] }}>
            Remove Avatar
          </Subhead>
        </AnimatedPressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[4],
  },
  avatarSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing[4],
  },
  avatarInfo: {
    flex: 1,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: Spacing[3],
    borderRadius: Radius[300],
    borderWidth: 1,
  },
  faceHashSection: {
    marginTop: Spacing[3],
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  toggleInfo: {
    flex: 1,
    marginRight: Spacing[3],
  },
  faceHashLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  faceHashPreview: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing[3],
    padding: Spacing[3],
    borderRadius: Radius[300],
    borderWidth: 1,
    gap: Spacing[3],
  },
  previewImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  previewText: {
    flex: 1,
  },
  removeButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing[3],
    paddingVertical: 10,
    paddingHorizontal: Spacing[3],
  },
});
