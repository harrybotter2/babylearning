import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashCard } from '../components/FlashCard';
import { useLessonSession } from '../hooks/useLessonSession';
import { SESSIONS_PER_DAY } from '../hooks/useHomeScreen';
import { CourseId } from '../hooks/useLesson';
import { successFeedback } from '../utils/haptics';

const MILESTONES: Record<number, string> = {
  7: '🌱 1週間達成！',
  14: '🌿 2週間達成！',
  30: '🌳 1ヶ月達成！',
  60: '✨ 2ヶ月達成！',
  100: '🏆 100日達成！',
  150: '💎 150日達成！',
  178: '🎊 全課程完了！',
};

interface LessonScreenProps {
  currentDay: number;
  courseId: CourseId;
  soundEnabled: boolean;
  todaySessionCount: number;
  onComplete: () => void;
  onCancel: () => void;
}

export function LessonScreen({
  currentDay,
  courseId,
  soundEnabled,
  todaySessionCount,
  onComplete,
  onCancel,
}: LessonScreenProps) {
  const [completedSessionNum, setCompletedSessionNum] = useState<number | null>(null);

  const { cards, handleFlashComplete } = useLessonSession({
    currentDay,
    courseId,
    soundEnabled,
    todaySessionCount,
    onComplete: () => {
      successFeedback();
      setCompletedSessionNum(todaySessionCount + 1);
    },
  });

  if (completedSessionNum !== null) {
    const isAllDone = completedSessionNum >= SESSIONS_PER_DAY;
    const milestone = isAllDone ? MILESTONES[currentDay] : null;

    return (
      <SafeAreaView style={styles.celebrationContainer} edges={['top', 'bottom']}>
        <Text style={styles.celebrationEmoji}>{isAllDone ? (milestone ? '🎉' : '⭐') : '✅'}</Text>

        {isAllDone ? (
          <>
            <Text style={styles.celebrationTitle}>
              {milestone ?? `Day ${currentDay} 完了！`}
            </Text>
            {milestone && (
              <Text style={styles.milestoneLabel}>{milestone}</Text>
            )}
            <Text style={styles.celebrationMessage}>
              {'赤ちゃんの数の感覚が\nまた少し育ちました。'}
            </Text>
            <Text style={styles.celebrationSub}>
              明日もいっしょに続けましょう 🌸
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.celebrationTitle}>
              {completedSessionNum}回目 完了！
            </Text>
            <View style={styles.sessionDotsRow}>
              {Array.from({ length: SESSIONS_PER_DAY }, (_, i) => (
                <View
                  key={i}
                  style={[
                    styles.sessionDot,
                    i < completedSessionNum ? styles.sessionDotDone : styles.sessionDotPending,
                  ]}
                />
              ))}
            </View>
            <Text style={styles.celebrationMessage}>
              {`あと ${SESSIONS_PER_DAY - completedSessionNum} 回で今日の目標達成です！`}
            </Text>
            <Text style={styles.celebrationSub}>
              30分以上間隔を空けて次のセッションを行いましょう
            </Text>
          </>
        )}

        <TouchableOpacity style={styles.homeButton} onPress={onComplete} activeOpacity={0.8}>
          <Text style={styles.homeButtonText}>ホームへ戻る</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const sessionLabel = `${todaySessionCount + 1} / ${SESSIONS_PER_DAY}`;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
          <Text style={styles.cancelText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.dayLabel}>Day {currentDay}</Text>
          <Text style={styles.sessionLabel}>セッション {sessionLabel}</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* フラッシュカード */}
      <View style={styles.cardArea}>
        <FlashCard
          cards={cards}
          soundEnabled={soundEnabled}
          onComplete={handleFlashComplete}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  cancelButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 20,
    color: '#999',
  },
  headerCenter: {
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2196F3',
  },
  sessionLabel: {
    fontSize: 11,
    color: '#AAA',
    marginTop: 1,
  },
  placeholder: {
    width: 36,
  },
  cardArea: {
    flex: 1,
  },
  // 完了画面
  celebrationContainer: {
    flex: 1,
    backgroundColor: '#FFFBF0',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  celebrationEmoji: {
    fontSize: 72,
    marginBottom: 16,
  },
  celebrationTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 8,
  },
  milestoneLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E07B00',
    marginBottom: 24,
  },
  sessionDotsRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 16,
  },
  sessionDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  sessionDotDone: {
    backgroundColor: '#4CAF50',
  },
  sessionDotPending: {
    backgroundColor: '#E0E0E0',
  },
  celebrationMessage: {
    fontSize: 17,
    color: '#444',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 8,
  },
  celebrationSub: {
    fontSize: 13,
    color: '#888',
    marginBottom: 48,
    textAlign: 'center',
    lineHeight: 20,
  },
  homeButton: {
    backgroundColor: '#2196F3',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 48,
    elevation: 4,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  homeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
