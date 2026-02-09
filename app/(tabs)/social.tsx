/**
 * Social Screen — Community feed, leaderboard, and achievements
 *
 * Refactored to use extracted feature components for better maintainability.
 * Uses design tokens for all spacing and colors.
 */
import React, { useState } from "react";
import { ScrollView, View, FlatList, StyleSheet } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { ScreenHeader } from "@/components/layouts";
import { PostCard, TabSelector, LeaderboardRow, AchievementCard } from "@/components/features/social";
import { SocialFeedSkeleton } from "@/components/ui/skeleton";
import { CDSEmptyState } from "@/components/ui/cds-empty-state";
import { useColors } from "@/hooks/use-colors";
import { useThemeContext } from "@/lib/theme-provider";
import { Footnote, Title3 } from "@/components/ui/cds-typography";
import { SOCIAL_FEED, LEADERBOARD, ACHIEVEMENTS } from "@/lib/mock-data";
import { Spacing, Radius } from "@/constants/spacing";
import { getShadow } from "@/constants/shadows";

const TABS = ["Feed", "Leaderboard", "Achievements"];

export default function SocialScreen() {
  const colors = useColors();
  const { colorScheme } = useThemeContext();
  const isDark = colorScheme === "dark";
  const [activeTab, setActiveTab] = useState("Feed");
  const [isLoading, setIsLoading] = useState(false);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <ScreenHeader title="Community" />

      {/* Tab Selector */}
      <TabSelector
        tabs={TABS}
        activeTab={activeTab}
        onChange={handleTabChange}
      />

      {/* Content */}
      {activeTab === "Feed" && (
        <>
          {isLoading ? (
            <SocialFeedSkeleton count={3} />
          ) : SOCIAL_FEED.length === 0 ? (
            <CDSEmptyState
              icon="bubble.left.fill"
              title="No Posts Yet"
              message="When you follow users and interact with posts, they'll appear here."
              actionLabel="Explore Users"
              onAction={() => {}}
              style={styles.emptyState}
            />
          ) : (
            <FlatList
              data={SOCIAL_FEED}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.feedContent}
              renderItem={({ item, index }) => <PostCard post={item} index={index} />}
            />
          )}
        </>
      )}

      {activeTab === "Leaderboard" && (
        <ScrollView
          contentContainerStyle={styles.leaderContent}
          showsVerticalScrollIndicator={false}
        >
          {LEADERBOARD.length === 0 ? (
            <CDSEmptyState
              icon="trophy"
              title="No Leaderboard Yet"
              message="Start trading to appear on the weekly leaderboard."
              style={styles.emptyState}
            />
          ) : (
            <>
              <View
                style={[
                  styles.leaderHeader,
                  {
                    backgroundColor: colors.surface,
                    borderColor: isDark ? colors.borderSubtle : colors.border,
                  },
                  getShadow("sm", isDark),
                ]}
              >
                <Title3 style={{ marginBottom: 4 }}>Weekly Top Performers</Title3>
                <Footnote color="muted">Based on portfolio return percentage</Footnote>
              </View>
              {LEADERBOARD.map((entry, index) => (
                <LeaderboardRow key={entry.rank} entry={entry} index={index} />
              ))}
              <View style={{ height: 100 }} />
            </>
          )}
        </ScrollView>
      )}

      {activeTab === "Achievements" && (
        <ScrollView
          contentContainerStyle={styles.achievementsContent}
          showsVerticalScrollIndicator={false}
        >
          {ACHIEVEMENTS.length === 0 ? (
            <CDSEmptyState
              icon="medal.fill"
              title="No Achievements Yet"
              message="Complete trading milestones to earn badges and achievements."
              style={styles.emptyState}
            />
          ) : (
            <>
              <View style={styles.achievementsGrid}>
                {ACHIEVEMENTS.map((achievement, index) => (
                  <AchievementCard key={achievement.id} achievement={achievement} index={index} />
                ))}
              </View>
              <View style={{ height: 100 }} />
            </>
          )}
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  feedContent: {
    padding: Spacing[4],
    paddingBottom: 100,
    gap: Spacing[3],
  },
  leaderContent: {
    paddingBottom: Spacing[5],
  },
  leaderHeader: {
    margin: Spacing[4],
    borderRadius: Radius[400],
    borderWidth: 1,
    padding: Spacing[4],
    alignItems: "center",
  },
  achievementsContent: {
    padding: Spacing[4],
    paddingBottom: Spacing[5],
  },
  achievementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing[3],
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing[4],
    paddingBottom: 80,
  },
});
