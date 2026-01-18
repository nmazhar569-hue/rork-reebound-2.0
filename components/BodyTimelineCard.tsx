import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Clock, TrendingUp, Heart, Leaf } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui';
import colors from '@/constants/colors';

interface TimelineInsight {
  id: string;
  icon: React.ElementType;
  text: string;
  timeframe: 'past' | 'present' | 'future';
  tone: 'neutral' | 'positive' | 'encouraging';
}

export function BodyTimelineCard() {
  const { dailyReadiness, dailyLogs, userProfile } = useApp();

  const insights = useMemo(() => {
    const result: TimelineInsight[] = [];
    const today = new Date();

    const sortedReadiness = [...dailyReadiness].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const sortedLogs = [...dailyLogs].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const lastHighPainDay = sortedReadiness.find((r) => r.painLevel >= 6);
    if (lastHighPainDay) {
      const daysSince = Math.floor(
        (today.getTime() - new Date(lastHighPainDay.date).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSince > 0) {
        const timeText =
          daysSince === 1
            ? '1 day'
            : daysSince < 7
            ? `${daysSince} days`
            : daysSince < 14
            ? '1 week'
            : daysSince < 30
            ? `${Math.floor(daysSince / 7)} weeks`
            : daysSince < 60
            ? '1 month'
            : `${Math.floor(daysSince / 30)} months`;

        const injuryLabel = userProfile?.injuryType === 'acl' ? 'ACL' : 
                           userProfile?.injuryType === 'meniscus' ? 'meniscus' :
                           userProfile?.injuryType === 'patella' ? 'patella' : 'knee';

        result.push({
          id: 'pain-free',
          icon: Heart,
          text: `${timeText} since last ${injuryLabel} flare-up`,
          timeframe: 'past',
          tone: 'positive',
        });
      }
    } else if (sortedReadiness.length > 3) {
      result.push({
        id: 'pain-free',
        icon: Heart,
        text: 'No significant flare-ups recorded',
        timeframe: 'past',
        tone: 'positive',
      });
    }

    const recentLogs = sortedLogs.slice(0, 14);
    const olderLogs = sortedLogs.slice(14, 28);

    if (recentLogs.length >= 3) {
      const recentWorkouts = recentLogs.filter((l) => l.workoutCompleted).length;
      const olderWorkouts = olderLogs.filter((l) => l.workoutCompleted).length;

      if (olderLogs.length >= 3) {
        const recentRate = recentWorkouts / Math.min(recentLogs.length, 14);
        const olderRate = olderWorkouts / Math.min(olderLogs.length, 14);

        if (recentRate > olderRate + 0.1) {
          result.push({
            id: 'volume-trend',
            icon: TrendingUp,
            text: 'Training volume increasing steadily',
            timeframe: 'present',
            tone: 'positive',
          });
        } else if (recentRate < olderRate - 0.15) {
          result.push({
            id: 'volume-trend',
            icon: Leaf,
            text: 'Taking time to recover — your body adapts during rest',
            timeframe: 'present',
            tone: 'encouraging',
          });
        } else if (recentWorkouts >= 2) {
          result.push({
            id: 'volume-trend',
            icon: TrendingUp,
            text: 'Maintaining a sustainable rhythm',
            timeframe: 'present',
            tone: 'neutral',
          });
        }
      } else if (recentWorkouts >= 2) {
        result.push({
          id: 'starting',
          icon: TrendingUp,
          text: 'Building your foundation',
          timeframe: 'present',
          tone: 'encouraging',
        });
      }
    }

    const recentRecovery = recentLogs.filter((l) => l.recoveryCompleted).length;
    if (recentRecovery >= 3) {
      result.push({
        id: 'mobility',
        icon: Leaf,
        text: 'Mobility consistency improving',
        timeframe: 'present',
        tone: 'positive',
      });
    }

    const recentConfidence = sortedReadiness.slice(0, 7);
    const olderConfidence = sortedReadiness.slice(7, 14);

    if (recentConfidence.length >= 3 && olderConfidence.length >= 3) {
      const confScore = (c: 'low' | 'medium' | 'high') =>
        c === 'high' ? 3 : c === 'medium' ? 2 : 1;

      const recentAvg =
        recentConfidence.reduce((sum, r) => sum + confScore(r.confidence), 0) /
        recentConfidence.length;
      const olderAvg =
        olderConfidence.reduce((sum, r) => sum + confScore(r.confidence), 0) /
        olderConfidence.length;

      if (recentAvg > olderAvg + 0.3) {
        result.push({
          id: 'confidence',
          icon: Heart,
          text: 'Growing trust in your body',
          timeframe: 'future',
          tone: 'positive',
        });
      }
    }

    if (result.length === 0 && sortedReadiness.length > 0) {
      result.push({
        id: 'journey',
        icon: Clock,
        text: 'Your body is learning and adapting',
        timeframe: 'present',
        tone: 'encouraging',
      });
    }

    return result.slice(0, 3);
  }, [dailyReadiness, dailyLogs, userProfile]);

  if (insights.length === 0) {
    return null;
  }

  return (
    <Card style={styles.container}>
      <Text style={styles.title}>Your Body&apos;s Journey</Text>
      <View style={styles.timeline}>
        {insights.map((insight, index) => {
          const IconComponent = insight.icon;
          const isLast = index === insights.length - 1;

          return (
            <View key={insight.id} style={styles.insightRow}>
              <View style={styles.iconContainer}>
                <View
                  style={[
                    styles.iconCircle,
                    insight.tone === 'positive' && styles.iconCirclePositive,
                    insight.tone === 'encouraging' && styles.iconCircleEncouraging,
                  ]}
                >
                  <IconComponent
                    size={14}
                    color={
                      insight.tone === 'positive'
                        ? colors.primary
                        : insight.tone === 'encouraging'
                        ? colors.accent
                        : colors.textSecondary
                    }
                  />
                </View>
                {!isLast && <View style={styles.connector} />}
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.insightText}>{insight.text}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },
  title: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  timeline: {
    gap: 4,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    alignItems: 'center',
    width: 32,
    marginRight: 12,
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surfaceDim,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCirclePositive: {
    backgroundColor: colors.primaryMuted,
  },
  iconCircleEncouraging: {
    backgroundColor: colors.accentMuted,
  },
  connector: {
    width: 1,
    height: 10,
    backgroundColor: colors.borderLight,
    marginVertical: 4,
  },
  textContainer: {
    flex: 1,
    paddingTop: 4,
    paddingBottom: 12,
  },
  insightText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
});
