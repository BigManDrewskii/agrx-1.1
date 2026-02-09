/**
 * Avatar — User avatar with FaceHash fallback and upload support
 *
 * Displays user avatars with priority:
 * 1. Uploaded avatar image (avatarUrl)
 * 2. FaceHash generated from email (if useFaceHash)
 * 3. Default CDS Avatar fallback
 *
 * Usage:
 *   <Avatar
 *     user={user}
 *     size="medium"
 *     shape="circle"
 *   />
 */
import React, { useMemo } from "react";
import { View } from "react-native";
import { Avatar as CDSAvatar } from "@coinbase/cds-mobile/media";
import { useColors } from "@/hooks/use-colors";

interface AvatarProps {
  /** User object containing avatar preferences */
  user: {
    avatarUrl: string | null;
    useFaceHash: boolean;
    email: string | null;
    name: string | null;
  } | null;
  /** Avatar size from CDS */
  size?: "s" | "m" | "l" | "xl" | "xxl" | "xxxl";
  /** Avatar shape from CDS */
  shape?: "circle" | "square" | "hexagon";
  /** Border color around avatar */
  borderColor?: any;
  /** Custom style */
  style?: any;
}

export function Avatar({
  user,
  size = "m",
  shape = "circle",
  borderColor,
  style,
}: AvatarProps) {
  const colors = useColors();

  const avatarSource = useMemo(() => {
    if (!user) return undefined;

    // Priority 1: Uploaded avatar image
    if (user.avatarUrl) {
      return user.avatarUrl;
    }

    // Priority 2: FaceHash (if enabled and email exists)
    if (user.useFaceHash && user.email) {
      // FaceHash generates deterministic avatars from strings
      // Using name as fallback if email is null
      const seed = user.email || user.name || user.email;
      return `https://facehash.dev/${encodeURIComponent(seed)}`;
    }

    // Priority 3: Default CDS fallback (undefined uses default image)
    return undefined;
  }, [user]);

  const fallbackName = user?.name || user?.email || undefined;

  return (
    <CDSAvatar
      src={avatarSource}
      name={fallbackName}
      size={size}
      shape={shape}
      borderColor={borderColor}
      colorScheme="blue"
      style={style}
    />
  );
}
