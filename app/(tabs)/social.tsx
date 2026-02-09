/**
 * Social Screen — Community feed, leaderboard, and achievements
 *
 * Refactored to use extracted feature components for better maintainability.
 */
import React, { useState, useEffect } from "react";
import { ScrollView, View, FlatList, StyleSheet } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { ScreenHeader } from "@/components/layouts";
import { PostCard, TabSelector, LeaderboardRow, AchievementCard } from "@/components/features/social";
import { SocialFeedSkeleton } from "@/components/ui/skeleton";
import { CDSEmptyState } from "@/components/ui/cds-empty-state";
import { useColors } from "@/hooks/use-colors";
import { Footnote } from "@/components/ui/cds-typography";
import { Title3 } from "@/components/ui/cds-typography";
import { SOCIAL_FEED, LEADERBOARD, ACHIEVEMENTS } from "@/lib/mock-data";

const TABS = ["Feed", "Leaderboard", "Achievements"];

export default function SocialScreen() {
  const colors = useColors();
  const [activeTab, setActiveTab] = useState("Feed");
  const [isLoading, setIsLoading] = useState(false);

  // Simulate loading on tab change (prepared for real API integration)
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Uncomment when integrating real API:
    // setIsLoading(true);
    // setTimeout(() => setIsLoading(false), 500);
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
                  { backgroundColor: colors.surface, borderColor: colors.border },
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
    padding: 16,
    paddingBottom: 100,
    gap: 12,
  },
  leaderContent: {
    paddingBottom: 20,
  },
  leaderHeader: {
    margin: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: "center",
  },
  achievementsContent: {
    padding: 16,
    paddingBottom: 20,
  },
  achievementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
});
