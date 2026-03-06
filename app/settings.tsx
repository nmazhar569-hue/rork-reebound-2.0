import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import {
  ChevronLeft,
  User,
  Moon,
  Sun,
  Scale,
  Bell,
  Sparkles,
  Heart,
  Activity,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Brain,
} from 'lucide-react-native';
import { PageHeader, Card } from '@/components/ui';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useHealthKit } from '@/contexts/HealthKitContext';
import colors, { borderRadius, shadows, layout } from '@/constants/colors';
import { haptics } from '@/utils/haptics';

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

interface SettingsItemProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
}

function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Card style={styles.sectionCard}>{children}</Card>
    </View>
  );
}

function SettingsItem({
  icon,
  label,
  description,
  value,
  onPress,
  showChevron = true,
  toggle = false,
  toggleValue = false,
  onToggle,
}: SettingsItemProps) {
  const handlePress = () => {
    if (onPress) {
      haptics.light();
      onPress();
    }
  };

  const handleToggle = (val: boolean) => {
    haptics.selection();
    if (onToggle) {
      onToggle(val);
    }
  };

  const content = (
    <>
      <View style={styles.itemIcon}>{icon}</View>
      <View style={styles.itemContent}>
        <Text style={styles.itemLabel}>{label}</Text>
        {description && <Text style={styles.itemDescription}>{description}</Text>}
      </View>
      {value && <Text style={styles.itemValue}>{value}</Text>}
      {toggle && (
        <Switch
          value={toggleValue}
          onValueChange={handleToggle}
          trackColor={{ false: colors.borderLight, true: colors.primary + '40' }}
          thumbColor={toggleValue ? colors.primary : colors.textTertiary}
          ios_backgroundColor={colors.borderLight}
        />
      )}
      {!toggle && showChevron && <ChevronRight size={20} color={colors.textTertiary} />}
    </>
  );

  if (toggle || !onPress) {
    return <View style={styles.settingsItem}>{content}</View>;
  }

  return (
    <TouchableOpacity style={styles.settingsItem} onPress={handlePress} activeOpacity={0.7}>
      {content}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState(true);
  const [aiAutoAdjust, setAiAutoAdjust] = useState(false);
  const [metricSystem, setMetricSystem] = useState<'imperial' | 'metric'>('imperial');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const { isConnected, healthData, connectHealthKit, connectGoogleFit, syncHealthData, disconnect } = useHealthKit();

  const handleHealthSync = async (value: boolean) => {
    if (value) {
      haptics.medium();

      const platformName = Platform.OS === 'ios' ? 'Apple Health' : 'Google Fit';
      const connectFunction = Platform.OS === 'ios' ? connectHealthKit : connectGoogleFit;

      try {
        const success = await connectFunction();
        if (success) {
          Alert.alert(
            'Connected!',
            `Successfully connected to ${platformName}. Your health data will now sync automatically.`,
            [{ text: 'OK', onPress: () => syncHealthData() }]
          );
        } else {
          Alert.alert(
            'Connection Failed',
            `Unable to connect to ${platformName}. Please check your permissions.`,
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        Alert.alert('Error', 'An error occurred while connecting to health services.');
      }
    } else {
      haptics.light();
      Alert.alert(
        'Disconnect Health Sync?',
        'Your health data will no longer be synced to the app.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Disconnect', style: 'destructive', onPress: disconnect },
        ]
      );
    }
  };

  const handleViewHealthData = () => {
    if (!isConnected) {
      Alert.alert('Not Connected', 'Please enable Health Sync first to view your data.');
      return;
    }

    const lastSyncText = healthData.lastSynced
      ? new Date(healthData.lastSynced).toLocaleString()
      : 'Never';

    Alert.alert(
      'Health Data',
      `Steps: ${healthData.steps.toLocaleString()}\n` +
      `Heart Rate: ${healthData.heartRate} bpm\n` +
      `Distance: ${(healthData.distance / 1609.34).toFixed(2)} mi\n` +
      `Calories: ${healthData.calories.toLocaleString()}\n` +
      `Active Minutes: ${healthData.activeMinutes} min\n` +
      `Sleep: ${healthData.sleepHours} hours\n\n` +
      `Last Synced: ${lastSyncText}`,
      [
        { text: 'Sync Now', onPress: syncHealthData },
        { text: 'Close', style: 'cancel' },
      ]
    );
  };

  const handleBack = () => {
    haptics.light();
    router.back();
  };

  const handleMetricChange = () => {
    haptics.selection();
    setMetricSystem(metricSystem === 'imperial' ? 'metric' : 'imperial');
  };

  const handleLogout = () => {
    haptics.light();
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    // TODO: Implement actual logout logic
    router.replace('/auth');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ChevronLeft size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 40 }} />
        </View>

        <SettingsSection title="Account">
          <SettingsItem
            icon={<User size={22} color={colors.primary} />}
            label="Profile"
            description="Manage your personal information"
            onPress={() => router.push('/profile')}
          />
          <View style={styles.divider} />
          <SettingsItem
            icon={<Heart size={22} color={colors.accent} />}
            label={Platform.OS === 'ios' ? 'Apple Health' : 'Google Fit'}
            description={isConnected ? `Connected • ${healthData.steps.toLocaleString()} steps today` : 'Connect to sync health data'}
            toggle
            toggleValue={isConnected}
            onToggle={handleHealthSync}
          />
          {isConnected && (
            <>
              <View style={styles.divider} />
              <SettingsItem
                icon={<Activity size={22} color={colors.success} />}
                label="View Health Data"
                description="See your latest synced health metrics"
                onPress={handleViewHealthData}
              />
            </>
          )}
        </SettingsSection>

        <SettingsSection title="Appearance">
          <SettingsItem
            icon={darkMode ? <Moon size={22} color={colors.primary} /> : <Sun size={22} color={colors.warning} />}
            label="Dark Mode"
            description="Switch between light and dark theme"
            toggle
            toggleValue={darkMode}
            onToggle={setDarkMode}
          />
        </SettingsSection>

        <SettingsSection title="Preferences">
          <SettingsItem
            icon={<Scale size={22} color={colors.primary} />}
            label="Units"
            description="Weight and distance measurements"
            value={metricSystem === 'imperial' ? 'Imperial (lb, mi)' : 'Metric (kg, km)'}
            onPress={handleMetricChange}
          />
          <View style={styles.divider} />
          <SettingsItem
            icon={<Bell size={22} color={colors.accent} />}
            label="Notifications"
            description="Push notifications and reminders"
            toggle
            toggleValue={notifications}
            onToggle={setNotifications}
          />
        </SettingsSection>

        <SettingsSection title="AI Assistant">
          <SettingsItem
            icon={<Sparkles size={22} color={colors.primary} />}
            label="AI Suggestions"
            description="Personalized workout recommendations"
            toggle
            toggleValue={aiSuggestions}
            onToggle={setAiSuggestions}
          />
          <View style={styles.divider} />
          <SettingsItem
            icon={<Brain size={22} color={colors.accent} />}
            label="Auto-Adjust Workouts"
            description="AI adjusts weights based on performance"
            toggle
            toggleValue={aiAutoAdjust}
            onToggle={setAiAutoAdjust}
          />
        </SettingsSection>

        <SettingsSection title="Support">
          <SettingsItem
            icon={<HelpCircle size={22} color={colors.primary} />}
            label="Help & FAQ"
            description="Get answers to common questions"
            onPress={() => { }}
          />
          <View style={styles.divider} />
          <SettingsItem
            icon={<Shield size={22} color={colors.accent} />}
            label="Privacy Policy"
            description="How we protect your data"
            onPress={() => { }}
          />
        </SettingsSection>

        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
            <LogOut size={20} color={colors.danger} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <ConfirmDialog
        visible={showLogoutConfirm}
        title="Log Out?"
        message="Are you sure you want to log out? You can always log back in with your account."
        confirmText="Log Out"
        cancelText="Cancel"
        type="danger"
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: layout.screenPadding,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: colors.text,
    letterSpacing: -0.6,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingLeft: 4,
  },
  sectionCard: {
    padding: 0,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 14,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContent: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 2,
    letterSpacing: -0.1,
  },
  itemDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500' as const,
  },
  itemValue: {
    fontSize: 14,
    color: colors.textTertiary,
    fontWeight: '600' as const,
    marginRight: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginLeft: 72,
  },
  logoutSection: {
    marginTop: 12,
    marginBottom: 24,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    padding: 18,
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    borderColor: colors.danger + '20',
    ...shadows.soft,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.danger,
    letterSpacing: 0.1,
  },
  bottomSpacer: {
    height: layout.tabBarHeight,
  },
});
