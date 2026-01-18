import { router } from 'expo-router';
import { ChevronRight, RefreshCw } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useApp } from '@/contexts/AppContext';
import { Card, PageHeader, ProgressBar } from '@/components/ui';
import colors, { borderRadius, shadows, layout } from '@/constants/colors';

const CHART_HEIGHT = 180;

export default function ProgressScreen() {
  const { dailyLogs, workoutPlan } = useApp();

  const weeklyData = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const logsThisWeek = dailyLogs.filter((log) => new Date(log.date) >= startOfWeek);
    const completedWorkouts = logsThisWeek.filter((log) => log.workoutCompleted).length;
    const painLogs = logsThisWeek.filter((l) => l.painLevel > 0);
    const confidenceLogs = logsThisWeek.filter((l) => l.confidenceLevel > 0);

    return {
      completedWorkouts,
      totalWorkouts: workoutPlan.length,
      avgPain: painLogs.length > 0 ? Math.round((painLogs.reduce((sum, l) => sum + l.painLevel, 0) / painLogs.length) * 10) / 10 : 0,
      avgConfidence: confidenceLogs.length > 0 ? Math.round((confidenceLogs.reduce((sum, l) => sum + l.confidenceLevel, 0) / confidenceLogs.length) * 10) / 10 : 0,
    };
  }, [dailyLogs, workoutPlan]);

  const narrative = useMemo(() => {
    if (weeklyData.completedWorkouts === 0) return "When you're ready, your first session is waiting. No rush.";
    const painTrend = weeklyData.avgPain <= 3 ? "low" : weeklyData.avgPain < 6 ? "moderate" : "high";
    const consistency = weeklyData.completedWorkouts >= 3 ? "consistent" : "building";
    return `You showed up ${weeklyData.completedWorkouts} times this week with ${painTrend} discomfort. ${consistency === 'consistent' ? 'Sustainable progress.' : 'Every session counts.'}`;
  }, [weeklyData]);

  const recoveryStreak = useMemo(() => {
    const sortedLogs = [...dailyLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const recoveryLogs = sortedLogs.filter((l) => l.recoveryCompleted);

    if (recoveryLogs.length === 0) return 0;
    const lastDate = recoveryLogs[0].date;
    if (lastDate !== today && lastDate !== yesterday) return 0;

    let streak = 0;
    let currentDate = new Date(lastDate);
    for (const log of recoveryLogs) {
      if (new Date(log.date).toISOString().split('T')[0] === currentDate.toISOString().split('T')[0]) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else break;
    }
    return streak;
  }, [dailyLogs]);

  const last7Days = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const log = dailyLogs.find((l) => l.date === dateStr);
      days.push({
        date: dateStr,
        day: date.getDate(),
        painLevel: log?.painLevel || null,
        confidenceLevel: log?.confidenceLevel || null,
        completed: log?.workoutCompleted || false,
      });
    }
    return days;
  }, [dailyLogs]);

  const progressPercentage = weeklyData.totalWorkouts > 0 ? (weeklyData.completedWorkouts / weeklyData.totalWorkouts) * 100 : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <PageHeader title="Progress" subtitle="Your journey, at your pace" />

      <Card style={styles.narrativeCard}>
        <Text style={styles.narrativeText}>{narrative}</Text>
      </Card>

      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Workouts This Week</Text>
          <Text style={styles.statValue}>{weeklyData.completedWorkouts}/{weeklyData.totalWorkouts}</Text>
          <ProgressBar progress={progressPercentage} />
        </Card>

        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Avg Pain Level</Text>
          <View style={styles.statValueRow}>
            <Text style={styles.statValue}>{weeklyData.avgPain > 0 ? weeklyData.avgPain.toFixed(1) : '-'}</Text>
            <Text style={styles.statValueSuffix}>/10</Text>
          </View>
          <Text style={styles.statNote}>Less discomfort over time</Text>
        </Card>
      </View>

      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Avg Confidence</Text>
          <View style={styles.statValueRow}>
            <Text style={styles.statValue}>{weeklyData.avgConfidence > 0 ? weeklyData.avgConfidence.toFixed(1) : '-'}</Text>
            <Text style={styles.statValueSuffix}>/10</Text>
          </View>
          <Text style={styles.statNote}>Trust builds gradually</Text>
        </Card>

        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Recovery Streak</Text>
          <Text style={styles.statValue}>{recoveryStreak} <Text style={styles.statValueSmall}>days</Text></Text>
          <Text style={styles.statNote}>Days of self-care</Text>
        </Card>
      </View>

      {[
        { title: 'Pain Level (Last 7 Days)', dataKey: 'painLevel' as const, activeColor: colors.primary },
        { title: 'Confidence (Last 7 Days)', dataKey: 'confidenceLevel' as const, activeColor: colors.accent },
      ].map((chart) => (
        <Card key={chart.title} style={styles.chartCard}>
          <Text style={styles.chartTitle}>{chart.title}</Text>
          <View style={styles.chart}>
            <View style={styles.chartYAxis}>
              <Text style={styles.yAxisLabel}>10</Text>
              <Text style={styles.yAxisLabel}>5</Text>
              <Text style={styles.yAxisLabel}>0</Text>
            </View>
            <View style={styles.chartContent}>
              <View style={styles.chartGrid}>
                {[0, 1, 2].map((i) => <View key={i} style={styles.gridLine} />)}
              </View>
              <View style={styles.barsContainer}>
                {last7Days.map((day) => (
                  <View key={day.date} style={styles.barColumn}>
                    <View style={[
                      styles.bar,
                      day[chart.dataKey] !== null && {
                        height: Math.max(4, ((day[chart.dataKey] ?? 0) / 10) * (CHART_HEIGHT - 40)),
                        backgroundColor: day.completed ? chart.activeColor : colors.textTertiary,
                      },
                    ]} />
                    <Text style={styles.barLabel}>{day.day}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </Card>
      ))}

      <View style={styles.settingsSection}>
        <Text style={styles.settingsTitle}>Settings</Text>
        <TouchableOpacity style={styles.settingsButton} onPress={() => router.push('/onboarding')}>
          <View style={styles.settingsIcon}>
            <RefreshCw size={22} color={colors.primary} />
          </View>
          <View style={styles.settingsContent}>
            <Text style={styles.settingsLabel}>Retake Assessment</Text>
            <Text style={styles.settingsDescription}>Revisit your profile anytime</Text>
          </View>
          <ChevronRight size={20} color={colors.textTertiary} />
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: layout.screenPadding, paddingTop: layout.screenPaddingTop, paddingBottom: 40 },
  narrativeCard: { marginBottom: 18 },
  narrativeText: { fontSize: 16, color: colors.text, lineHeight: 25, fontWeight: '500' as const, textAlign: 'center' },
  statsGrid: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  statCard: { flex: 1, padding: 18 },
  statLabel: { fontSize: 11, color: colors.textTertiary, marginBottom: 8, fontWeight: '600' as const, textTransform: 'uppercase', letterSpacing: 0.6 },
  statValueRow: { flexDirection: 'row', alignItems: 'baseline' },
  statValue: { fontSize: 24, fontWeight: '700' as const, color: colors.text },
  statValueSmall: { fontSize: 14, fontWeight: '400' as const, color: colors.textSecondary },
  statValueSuffix: { fontSize: 14, color: colors.textTertiary, marginLeft: 2 },
  statNote: { fontSize: 12, color: colors.textTertiary, marginTop: 5 },
  chartCard: { marginBottom: 18 },
  chartTitle: { fontSize: 16, fontWeight: '600' as const, color: colors.text, marginBottom: 18 },
  chart: { flexDirection: 'row', height: CHART_HEIGHT },
  chartYAxis: { width: 26, justifyContent: 'space-between', paddingVertical: 20 },
  yAxisLabel: { fontSize: 11, color: colors.textTertiary },
  chartContent: { flex: 1, position: 'relative' },
  chartGrid: { position: 'absolute', top: 20, left: 0, right: 0, bottom: 20, justifyContent: 'space-between' },
  gridLine: { height: 1, backgroundColor: colors.borderSubtle },
  barsContainer: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', paddingHorizontal: 8, paddingTop: 20, paddingBottom: 20 },
  barColumn: { alignItems: 'center', justifyContent: 'flex-end', flex: 1 },
  bar: { width: 22, backgroundColor: colors.textTertiary, borderRadius: borderRadius.full, minHeight: 4 },
  barLabel: { fontSize: 11, color: colors.textTertiary, marginTop: 8, fontWeight: '500' as const },
  settingsSection: { marginTop: 6, marginBottom: 18 },
  settingsTitle: { fontSize: 16, fontWeight: '600' as const, color: colors.text, marginBottom: 12 },
  settingsButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: 16, borderRadius: borderRadius.xxl, ...shadows.soft },
  settingsIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primaryMuted, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  settingsContent: { flex: 1 },
  settingsLabel: { fontSize: 16, fontWeight: '600' as const, color: colors.text, marginBottom: 3 },
  settingsDescription: { fontSize: 13, color: colors.textSecondary },
  bottomSpacer: { height: layout.tabBarHeight },
});
