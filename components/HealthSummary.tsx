import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Heart, Footprints, Moon, Plus, Activity, Smartphone, Dumbbell } from 'lucide-react-native';
import { useHealth } from '@/contexts/HealthContext';
import colors, { borderRadius, shadows } from '@/constants/colors';
import { haptics } from '@/utils/haptics';

export function HealthSummary() {
  const { 
    isConnected, 
    connectPlatform, 
    getTodaySleep, 
    getTodayHeartRate, 
    getTodaySteps,
    calculateReadinessFactors,
    healthData
  } = useHealth();
  
  const metrics = useMemo(() => {
    if (!isConnected) return null;

    const sleep = getTodaySleep();
    const heartRate = getTodayHeartRate();
    const steps = getTodaySteps();
    const workouts = healthData.externalWorkouts || [];
    const lastWorkout = workouts.length > 0 
      ? [...workouts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] 
      : null;
    
    // Format sleep
    let sleepValue = '--';
    if (sleep) {
      const hours = Math.floor(sleep.durationMinutes / 60);
      const mins = sleep.durationMinutes % 60;
      sleepValue = `${hours}h ${mins}m`;
    }

    // Format HR
    const hrValue = heartRate?.restingHR ? `${heartRate.restingHR} bpm` : '--';

    // Format Steps
    const stepsValue = steps > 0 ? steps.toLocaleString() : '0';

    const items = [
      {
        id: 'sleep',
        label: 'Sleep',
        value: sleepValue,
        subtext: 'Last Night',
        icon: Moon,
        color: '#6366F1', // Indigo
      },
      {
        id: 'hr',
        label: 'Resting HR',
        value: hrValue,
        subtext: 'Today',
        icon: Heart,
        color: '#EC4899', // Pink
      },
      {
        id: 'steps',
        label: 'Steps',
        value: stepsValue,
        subtext: 'Today',
        icon: Footprints,
        color: '#10B981', // Emerald
      }
    ];

    if (lastWorkout) {
        // Format workout time
        const date = new Date(lastWorkout.date);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        let timeAgo = 'Today';
        if (diffHrs >= 24) {
            const days = Math.floor(diffHrs / 24);
            timeAgo = days === 1 ? 'Yesterday' : `${days}d ago`;
        } else if (diffHrs > 0) {
            timeAgo = `${diffHrs}h ago`;
        } else {
             const diffMins = Math.floor(diffMs / (1000 * 60));
             timeAgo = `${diffMins}m ago`;
        }

        items.push({
            id: 'workout',
            label: lastWorkout.type,
            value: `${lastWorkout.durationMinutes}m`,
            subtext: timeAgo,
            icon: Dumbbell,
            color: '#F59E0B', // Amber
        });
    }

    return items;
  }, [isConnected, getTodaySleep, getTodayHeartRate, getTodaySteps, healthData]);

  // Get one insight if available
  const insight = useMemo(() => {
    if (!isConnected) return null;
    const factors = calculateReadinessFactors();
    // Use the first insight if it exists
    return factors.insights.length > 0 ? factors.insights[0] : null;
  }, [isConnected, calculateReadinessFactors]);

  const handleConnect = async () => {
    haptics.selection();
    if (Platform.OS === 'ios') {
        await connectPlatform('apple_health');
    } else {
        // Fallback for non-iOS or just to show the intent
        await connectPlatform('google_fit'); 
    }
  };

  if (!isConnected) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
            <View style={styles.titleRow}>
                <Activity size={16} color={colors.textSecondary} />
                <Text style={styles.label}>Health Signals</Text>
            </View>
        </View>
        <TouchableOpacity 
            style={styles.connectCard} 
            onPress={handleConnect}
            activeOpacity={0.8}
        >
          <View style={styles.connectIcon}>
            <Smartphone size={24} color={colors.primary} />
          </View>
          <View style={styles.connectContent}>
            <Text style={styles.connectTitle}>Connect Health Data</Text>
            <Text style={styles.connectDesc}>
                See your sleep and recovery patterns here to help Ree guide you better.
            </Text>
          </View>
          <Plus size={20} color={colors.textTertiary} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
        <View style={styles.header}>
            <View style={styles.titleRow}>
                <Activity size={16} color={colors.textSecondary} />
                <Text style={styles.label}>Health Signals</Text>
            </View>
        </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollContainer}
      >
        {metrics?.map((metric) => (
          <View key={metric.id} style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <View style={[styles.iconContainer, { backgroundColor: metric.color + '15' }]}>
                <metric.icon size={14} color={metric.color} />
              </View>
              <Text style={styles.metricSubtext}>{metric.subtext}</Text>
            </View>
            <Text style={styles.metricValue}>{metric.value}</Text>
            <Text style={styles.metricLabel}>{metric.label}</Text>
          </View>
        ))}
      </ScrollView>

      {insight && (
        <View style={styles.insightContainer}>
            <Text style={styles.insightText}>{insight}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4, 
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  connectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: 16,
    gap: 14,
    ...shadows.soft,
  },
  connectIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectContent: {
    flex: 1,
  },
  connectTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 4,
  },
  connectDesc: {
    fontSize: 13,
    color: colors.textTertiary,
    lineHeight: 18,
  },
  scrollContainer: {
    marginHorizontal: -20, // Negative margin to allow edge-to-edge scrolling
  },
  scrollContent: {
    paddingHorizontal: 20, // Padding to start content aligned
    gap: 10,
    paddingBottom: 4, // Space for shadow
  },
  metricCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 14,
    width: 130,
    ...shadows.soft,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricSubtext: {
    fontSize: 11,
    color: colors.textTertiary,
  },
  metricValue: {
    fontSize: 19,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 2,
    letterSpacing: -0.5,
  },
  metricLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500' as const,
  },
  insightContainer: {
    marginTop: 12,
    paddingHorizontal: 4,
  },
  insightText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 18,
  },
});
