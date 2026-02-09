/**
 * Avatar — User avatar with FaceHash fallback and upload support
 *
 * Displays user avatars with priority:
 * 1. Uploaded avatar image (avatarUrl)
 * 2. FaceHash generated from email via facehash.dev API (if useFaceHash)
 * 3. Default CDS Avatar fallback (initials)
 *
 * FaceHash integration uses the hosted API endpoint:
 *   https://www.facehash.dev/api/avatar?name={seed}&size={size}
 * Returns a deterministic PNG — same input = same face, always.
 *
 * Usage:
 *   <Avatar user={user} size="m" />
 */
import React, { useMemo } from "react";
import { Avatar as CDSAvatar } from "@coinbase/cds-mobile/media";
import { useColors } from "@/hooks/use-colors";

/** Base URL for the FaceHash hosted avatar API */
const FACEHASH_API = "https://www.facehash.dev/api/avatar";

/** Map CDS size tokens to pixel values for the FaceHash API */
const SIZE_MAP: Record<string, number> = {
  s: 64,
  m: 96,
  l: 128,
  xl: 192,
  xxl: 256,
  xxxl: 320,
};

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

/**
 * Build a FaceHash API URL for a given seed string and pixel size.
 * The API returns a cached PNG that is deterministic — same seed = same face.
 */
function buildFaceHashUrl(seed: string, pixelSize: number): string {
  const params = new URLSearchParams({
    name: seed,
    size: String(pixelSize),
    variant: "gradient",
    showInitial: "true",
  });
  return `${FACEHASH_API}?${params.toString()}`;
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

    // Priority 2: FaceHash API (if enabled and we have a seed)
    if (user.useFaceHash) {
      const seed = user.email || user.name;
      if (seed) {
        const px = SIZE_MAP[size] ?? 96;
        return buildFaceHashUrl(seed, px);
      }
    }

    // Priority 3: Default CDS fallback (undefined uses initials)
    return undefined;
  }, [user, size]);

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
