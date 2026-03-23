import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as ExpoNotifications from 'expo-notifications';
import { StreakBadge } from './src/components/StreakBadge';
import { ProgressCalendar } from './src/components/ProgressCalendar';
import { useHomeScreen } from './src/hooks/useHomeScreen';
import { useSettings, AppSettings } from './src/hooks/useSettings';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { LessonScreen } from './src/screens/LessonScreen';
import { TOTAL_DAYS, getPhase, Phase } from './src/data/curriculum';
import { getScienceCardForDay, getDailyMessage } from './src/data/scienceCards';
import { requestReviewIfAvailable } from './src/utils/review';
import { lightImpact } from './src/utils/haptics';
import { calcAgeMonths, ageToLabel } from './src/utils/babyAge';
import { CHANNEL_ID as NOTIFICATION_CHANNEL_ID } from './src/utils/notifications';

// Android 通知チャンネルを作成（Android 8+で必須）
if (Platform.OS === 'android') {
  ExpoNotifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
    name: '毎日のリマインダー',
    importance: ExpoNotifications.AndroidImportance.HIGH,
  });
}

// 通知ハンドラを設定（フォアグラウンド時もバナー表示）
ExpoNotifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

type Screen = 'home' | 'lesson' | 'settings';

const PHASE_INFO: Record<Phase, { label: string; emoji: string; color: string }> = {
  recognition: { label: '認識期', emoji: '👁', color: '#2196F3' },
  equation:    { label: '等式期', emoji: '➕', color: '#9C27B0' },
  abstraction: { label: '抽象期', emoji: '🔢', color: '#FF9800' },
  deepening:   { label: '深化期', emoji: '✨', color: '#E91E63' },
};

function AppContent() {
  const [screen, setScreen] = useState<Screen>('home');
  const { currentDay, streak, completedDayNumbers, todayDone, todaySessionCount, isComplete, loading, reload } =
    useHomeScreen();
  const { settings, loading: settingsLoading, save: saveSettings } = useSettings();

  // 初回ロード中
  if (loading || settingsLoading) {
    return (
      <SafeAreaView style={styles.centered} edges={['top', 'bottom']}>
        <ActivityIndicator size="large" color="#2196F3" />
      </SafeAreaView>
    );
  }

  // オンボーディング（学習未開始）
  if (!settings.onboardingCompleted) {
    return (
      <OnboardingScreen
        onComplete={async (s: AppSettings) => {
          await saveSettings(s);
          await reload();
        }}
      />
    );
  }

  // 設定画面
  if (screen === 'settings') {
    return (
      <SettingsScreen
        current={settings}
        currentDay={currentDay}
        completedDayNumbers={completedDayNumbers}
        onSave={saveSettings}
        onClose={() => setScreen('home')}
      />
    );
  }

  // レッスン画面
  if (screen === 'lesson') {
    return (
      <LessonScreen
        currentDay={currentDay}
        courseId={settings.courseId}
        soundEnabled={settings.soundEnabled}
        todaySessionCount={todaySessionCount}
        onComplete={async () => {
          setScreen('home');
          await reload();
          if (currentDay === 7) {
            await requestReviewIfAvailable();
          }
        }}
        onCancel={() => setScreen('home')}
      />
    );
  }

  const scienceCard = getScienceCardForDay(currentDay);
  const babyAgeLabel = settings.babyBirthDate
    ? ageToLabel(calcAgeMonths(settings.babyBirthDate))
    : null;
  const phase = isComplete ? null : getPhase(currentDay);
  const phaseInfo = phase ? PHASE_INFO[phase] : null;
  const dailyMessage = phase ? getDailyMessage(currentDay, phase) : null;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      {/* ヘッダー */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Science Dots</Text>
          {babyAgeLabel && (
            <Text style={styles.headerSubtitle}>{babyAgeLabel}のあかちゃん</Text>
          )}
        </View>
        <View style={styles.headerRight}>
          <StreakBadge streak={streak} />
          <TouchableOpacity onPress={() => setScreen('settings')} style={styles.settingsButton}>
            <Text style={styles.settingsIcon}>⚙</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 進捗カレンダー */}
      <View style={styles.section}>
        <ProgressCalendar
          totalDays={TOTAL_DAYS}
          currentDay={currentDay}
          completedDays={completedDayNumbers}
        />
      </View>

      {/* 今日のカード */}
      <View style={styles.card}>
        {isComplete ? (
          <>
            <Text style={styles.completeEmoji}>🎊</Text>
            <Text style={styles.cardTitle}>178日完走！おめでとうございます</Text>
            <Text style={styles.cardHint}>お子さんの数の感覚を育てる旅が完了しました。</Text>
          </>
        ) : todayDone ? (
          <>
            <View style={styles.cardTopRow}>
              <Text style={[styles.dayLabel, { color: '#4CAF50' }]}>Day {currentDay} ✓</Text>
              {phaseInfo && (
                <View style={[styles.phaseBadge, { backgroundColor: phaseInfo.color + '20' }]}>
                  <Text style={styles.phaseBadgeText}>{phaseInfo.emoji} {phaseInfo.label}</Text>
                </View>
              )}
            </View>
            {dailyMessage && (
              <Text style={styles.cardTitle}>{dailyMessage}</Text>
            )}
            <Text style={styles.cardDoneMessage}>{'今日もよく頑張りました！\n明日もいっしょに続けましょう 🌸'}</Text>
          </>
        ) : todaySessionCount > 0 ? (
          <>
            <View style={styles.cardTopRow}>
              <Text style={styles.dayLabel}>Day {currentDay}</Text>
              {phaseInfo && (
                <View style={[styles.phaseBadge, { backgroundColor: phaseInfo.color + '20' }]}>
                  <Text style={[styles.phaseBadgeText, { color: phaseInfo.color }]}>{phaseInfo.emoji} {phaseInfo.label}</Text>
                </View>
              )}
            </View>
            {dailyMessage && (
              <Text style={styles.cardTitle}>{dailyMessage}</Text>
            )}
            <View style={styles.sessionProgressRow}>
              {Array.from({ length: 3 }, (_, i) => (
                <View
                  key={i}
                  style={[styles.sessionProgressDot, i < todaySessionCount ? styles.sessionProgressDotDone : styles.sessionProgressDotPending]}
                />
              ))}
              <Text style={styles.sessionProgressText}>{todaySessionCount} / 3 セッション完了</Text>
            </View>
          </>
        ) : (
          <>
            <View style={styles.cardTopRow}>
              <Text style={styles.dayLabel}>Day {currentDay}</Text>
              {phaseInfo && (
                <View style={[styles.phaseBadge, { backgroundColor: phaseInfo.color + '20' }]}>
                  <Text style={[styles.phaseBadgeText, { color: phaseInfo.color }]}>{phaseInfo.emoji} {phaseInfo.label}</Text>
                </View>
              )}
            </View>
            {dailyMessage && (
              <Text style={styles.cardTitle}>{dailyMessage}</Text>
            )}
          </>
        )}
      </View>

      {/* レッスンボタン */}
      {!isComplete && (
        <TouchableOpacity
          style={[styles.startButton, todayDone && styles.startButtonDone, todaySessionCount > 0 && !todayDone && styles.startButtonInProgress]}
          onPress={() => { lightImpact(); setScreen('lesson'); }}
          activeOpacity={0.8}
        >
          <Text style={styles.startButtonText}>
            {todayDone
              ? '✓ 完了済み　もう一度見る'
              : todaySessionCount > 0
                ? `▶  ${todaySessionCount + 1}回目のセッションへ`
                : '▶  今日のレッスンを始める'}
          </Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 20,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingsButton: {
    padding: 4,
  },
  settingsIcon: {
    fontSize: 22,
    color: '#888',
  },
  section: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#FF8A65',
    fontWeight: '600',
    marginTop: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  phaseBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  phaseBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#555',
  },
  dayLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2196F3',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    lineHeight: 24,
  },
  cardHint: {
    fontSize: 12,
    color: '#AAA',
    marginTop: 8,
  },
  cardDoneMessage: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 10,
    lineHeight: 22,
    fontWeight: '600',
  },
  completeEmoji: {
    fontSize: 40,
    textAlign: 'center',
    marginBottom: 8,
  },
  startButton: {
    backgroundColor: '#2196F3',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  startButtonDone: {
    backgroundColor: '#4CAF50',
  },
  startButtonInProgress: {
    backgroundColor: '#FF9800',
  },
  sessionProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  sessionProgressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  sessionProgressDotDone: {
    backgroundColor: '#FF9800',
  },
  sessionProgressDotPending: {
    backgroundColor: '#E0E0E0',
  },
  sessionProgressText: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '600',
    marginLeft: 4,
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
