/**
 * AGRX User Router
 *
 * tRPC router for user profile management including avatar uploads.
 * All endpoints require authentication (protectedProcedure).
 */
import { z } from "zod";
import { eq } from "drizzle-orm";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { storagePut } from "./storage";

export const userRouter = router({
  /**
   * Upload avatar image to S3 and update user profile
   * Accepts base64-encoded image data
   */
  uploadAvatar: protectedProcedure
    .input(
      z.object({
        imageData: z.string(), // base64 data URL (data:image/jpeg;base64,...)
        contentType: z.enum(["image/jpeg", "image/png", "image/webp"]).default("image/jpeg"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      // Extract base64 data (remove data URL prefix)
      const base64Data = input.imageData.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      // Generate unique filename with random suffix to prevent enumeration
      const randomSuffix = Math.random().toString(36).substring(2, 15);
      const filename = `avatars/${userId}/${randomSuffix}.jpg`;

      // Upload to S3
      const { url } = await storagePut(filename, buffer, input.contentType);

      // Update user avatarUrl in database
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      await db
        .update(users)
        .set({ avatarUrl: url })
        .where(eq(users.id, userId));

      return {
        success: true as const,
        data: { avatarUrl: url },
      };
    }),

  /**
   * Update avatar preferences (FaceHash toggle)
   */
  updateAvatarPreferences: protectedProcedure
    .input(
      z.object({
        useFaceHash: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      await db
        .update(users)
        .set({ useFaceHash: input.useFaceHash })
        .where(eq(users.id, userId));

      return {
        success: true as const,
        data: { useFaceHash: input.useFaceHash },
      };
    }),

  /**
   * Remove custom avatar (revert to FaceHash or default)
   */
  removeAvatar: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.user.id;

    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    await db
      .update(users)
      .set({ avatarUrl: null })
      .where(eq(users.id, userId));

    return {
      success: true as const,
    };
  }),
});
