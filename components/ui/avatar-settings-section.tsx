/**
 * AvatarSettingsSection — Avatar management section for settings
 *
 * Allows users to:
 * - View current avatar
 * - Upload new image
 * - Toggle FaceHash on/off
 * - Remove custom avatar
 */
import React, { useState } from "react";
import { View, StyleSheet, Alert, Platform, TouchableOpacity } from "react-native";
import * as ImagePicker from "expo-image-picker";
import ReAnimated, { FadeIn } from "react-native-reanimated";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import { Avatar } from "@/components/ui/avatar";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Switch } from "react-native";
import {
  Subhead,
  Caption1,
} from "@/components/ui/typography";
import { FontFamily } from "@/constants/typography";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { useColors } from "@/hooks/use-colors";

interface AvatarSettingsSectionProps {
  isLast?: boolean;
}

export function AvatarSettingsSection({ isLast = false }: AvatarSettingsSectionProps) {
  const colors = useColors();
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const [isUploading, setIsUploading] = useState(false);

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
      "Are you sure you want to remove your custom avatar? Your FaceHash will be shown instead.",
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

  if (!user) return null;

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
      {/* Current Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarInfo}>
          <Subhead style={{ fontFamily: FontFamily.medium }}>Profile Avatar</Subhead>
          <Caption1 color="muted" style={{ marginTop: 2 }}>
            {user.avatarUrl
              ? "Custom avatar uploaded"
              : user.useFaceHash
              ? "Using FaceHash (generated from email)"
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
          { opacity: isUploading ? 0.5 : 1 },
        ]}
      >
        <IconSymbol name="photo" size={18} color={colors.primary} />
        <Subhead style={{ fontFamily: FontFamily.medium, color: colors.primary, marginLeft: 8 }}>
          {isUploading ? "Uploading..." : "Upload New Photo"}
        </Subhead>
      </AnimatedPressable>

      {/* FaceHash Toggle */}
      <View style={styles.toggleRow}>
        <View style={styles.toggleInfo}>
          <Subhead style={{ fontFamily: FontFamily.medium }}>Use FaceHash</Subhead>
          <Caption1 color="muted" style={{ marginTop: 2 }}>
            Generate unique avatar from email
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

      {/* Remove Button (only show if custom avatar exists) */}
      {user.avatarUrl && (
        <AnimatedPressable
          variant="card"
          onPress={handleRemoveAvatar}
          style={styles.removeButton}
        >
          <IconSymbol name="trash" size={16} color={colors.error} />
          <Subhead style={{ fontFamily: FontFamily.medium, color: colors.error, marginLeft: 8 }}>
            Remove Avatar
          </Subhead>
        </AnimatedPressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  avatarSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  avatarInfo: {
    flex: 1,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    paddingVertical: 4,
  },
  toggleInfo: {
    flex: 1,
  },
  removeButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
});
