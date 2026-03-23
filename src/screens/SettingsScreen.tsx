import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppSettings } from '../hooks/useSettings';
import { CourseId } from '../hooks/useLesson';
import { isValidTimeString, scheduleTestNotification } from '../utils/notifications';
import { getScienceCardForDay } from '../data/scienceCards';
import { calcAgeMonths, ageToLabel, ageMonthsToCourseId } from '../utils/babyAge';
import { YearMonthPicker } from '../components/YearMonthPicker';

interface SettingsScreenProps {
  current: AppSettings;
  currentDay: number;
  completedDayNumbers: Set<number>;
  onSave: (settings: AppSettings) => Promise<void>;
  onClose: () => void;
}

const COURSES: { id: CourseId; label: string }[] = [
  { id: '0-6M', label: '0〜6ヶ月（1.5秒）' },
  { id: '6-18M', label: '6〜18ヶ月（1.0秒）' },
  { id: '18-36M', label: '18〜36ヶ月（0.7秒）' },
];

const BADGES = [
  { day: 1, emoji: '🌱', label: 'はじめの一歩' },
  { day: 7, emoji: '🌿', label: '1週間達成' },
  { day: 14, emoji: '🌳', label: '2週間達成' },
  { day: 30, emoji: '⭐', label: '1ヶ月達成' },
  { day: 60, emoji: '✨', label: '2ヶ月達成' },
  { day: 100, emoji: '🏆', label: '100日達成' },
  { day: 150, emoji: '💎', label: '150日達成' },
  { day: 178, emoji: '🎊', label: '全課程完走' },
];

export function SettingsScreen({ current, currentDay, completedDayNumbers, onSave, onClose }: SettingsScreenProps) {
  const [courseId, setCourseId] = useState<CourseId>(current.courseId);
  const [soundEnabled, setSoundEnabled] = useState(current.soundEnabled);
  const [notifEnabled, setNotifEnabled] = useState(current.notificationTime !== null);
  const [notifTime, setNotifTime] = useState(current.notificationTime ?? '09:00');
  const [babyBirthDate, setBabyBirthDate] = useState(current.babyBirthDate ?? '');
  const [saving, setSaving] = useState(false);

  const scienceCard = getScienceCardForDay(currentDay);

  const ageMonths = babyBirthDate && /^\d{4}-\d{2}$/.test(babyBirthDate)
    ? calcAgeMonths(babyBirthDate)
    : null;
  const ageLabel = ageMonths !== null ? ageToLabel(ageMonths) : null;
  // 現在の月齢から推奨されるコース（ズレていたら提案を表示）
  const suggestedCourseId = ageMonths !== null ? ageMonthsToCourseId(ageMonths) : null;
  const showCourseSuggestion = suggestedCourseId !== null && suggestedCourseId !== courseId;

  const handleSave = async () => {
    if (notifEnabled && !isValidTimeString(notifTime)) {
      Alert.alert('エラー', '通知時刻はHH:MM形式で入力してください（例: 09:00）');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        courseId,
        soundEnabled,
        notificationTime: notifEnabled ? notifTime : null,
        babyBirthDate: babyBirthDate || null,
        onboardingCompleted: current.onboardingCompleted,
      });
      onClose();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      Alert.alert('エラー', `設定の保存に失敗しました。\n${msg}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* ナビバー */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.cancelText}>キャンセル</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>設定</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          <Text style={[styles.saveText, saving && styles.saveTextDisabled]}>保存</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* 今日のサイエンス解説 */}
        {scienceCard && (
          <>
            <Text style={styles.sectionTitle}>今日のサイエンス（Day {currentDay}）</Text>
            <View style={styles.scienceCard}>
              <Text style={styles.scienceTitle}>{scienceCard.title}</Text>
              <Text style={styles.scienceBody}>{scienceCard.body}</Text>
              {scienceCard.source && (
                <Text style={styles.scienceSource}>出典: {scienceCard.source}</Text>
              )}
            </View>
          </>
        )}

        {/* 赤ちゃんの情報 */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>赤ちゃんの情報</Text>
        <View style={styles.pickerRow}>
          <Text style={styles.rowLabel}>生まれた年月</Text>
          <View style={styles.pickerWrap}>
            <YearMonthPicker
              value={babyBirthDate}
              onChange={setBabyBirthDate}
              placeholder="タップして選択"
            />
          </View>
        </View>
        {ageLabel && (
          <Text style={styles.ageLabelText}>現在の月齢: {ageLabel}</Text>
        )}

        {/* 実績バッジ */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>実績バッジ</Text>
        <View style={styles.badgesContainer}>
          {BADGES.map((badge) => {
            const earned = completedDayNumbers.size >= badge.day;
            return (
              <View
                key={badge.day}
                style={[styles.badge, earned ? styles.badgeEarned : styles.badgeUnearned]}
              >
                <Text style={styles.badgeEmoji}>{badge.emoji}</Text>
                <Text style={[styles.badgeLabel, !earned && styles.badgeLabelUnearned]}>
                  {badge.label}
                </Text>
              </View>
            );
          })}
        </View>

        {/* コース */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>月齢コース</Text>
        {showCourseSuggestion && (
          <View style={styles.courseSuggestion}>
            <Text style={styles.courseSuggestionText}>
              💡 現在の月齢（{ageLabel}）に合わせて{'\n'}
              「{COURSES.find((c) => c.id === suggestedCourseId)?.label}」への変更をお勧めします
            </Text>
            <TouchableOpacity
              style={styles.courseSuggestionButton}
              onPress={() => setCourseId(suggestedCourseId!)}
              activeOpacity={0.8}
            >
              <Text style={styles.courseSuggestionButtonText}>適用する</Text>
            </TouchableOpacity>
          </View>
        )}
        {COURSES.map((course) => (
          <TouchableOpacity
            key={course.id}
            style={[styles.row, courseId === course.id && styles.rowSelected]}
            onPress={() => setCourseId(course.id)}
          >
            <Text style={styles.rowLabel}>{course.label}</Text>
            {courseId === course.id && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
        ))}

        {/* サウンド */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>サウンド</Text>
        <View style={styles.switchRow}>
          <Text style={styles.rowLabel}>効果音</Text>
          <Switch value={soundEnabled} onValueChange={setSoundEnabled} trackColor={{ true: '#2196F3' }} />
        </View>

        {/* 通知 */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>リマインダー</Text>
        <View style={styles.switchRow}>
          <Text style={styles.rowLabel}>毎日通知</Text>
          <Switch value={notifEnabled} onValueChange={setNotifEnabled} trackColor={{ true: '#2196F3' }} />
        </View>
        {notifEnabled && (
          <View style={styles.row}>
            <Text style={styles.rowLabel}>通知時刻</Text>
            <TextInput
              style={styles.timeInput}
              value={notifTime}
              onChangeText={setNotifTime}
              placeholder="09:00"
              keyboardType="numbers-and-punctuation"
              maxLength={5}
            />
          </View>
        )}
        {notifEnabled && (
          <TouchableOpacity
            style={styles.testButton}
            onPress={async () => {
              await scheduleTestNotification();
              Alert.alert('テスト通知', '10秒後に通知が届きます。\nアプリをバックグラウンドにしてください。');
            }}
          >
            <Text style={styles.testButtonText}>🔔 テスト通知を送る（10秒後）</Text>
          </TouchableOpacity>
        )}

        {/* このアプリについて */}
        <Text style={[styles.sectionTitle, { marginTop: 32 }]}>このアプリについて</Text>
        <View style={styles.aboutCard}>
          <Text style={styles.aboutHeading}>🧠 科学的根拠</Text>
          <Text style={styles.aboutBody}>
            赤ちゃんは生まれながらに「多い・少ない」を直感的に区別する能力（近似数感覚：ANS）を持っています。この能力はハーバード大学などの研究で確認されており、幼少期に育てることで小学校以降の算数・数学力との相関が示されています。
          </Text>
          <Text style={styles.aboutSource}>Izard et al., 2009 / Halberda et al., 2008</Text>

          <View style={styles.aboutDivider} />

          <Text style={styles.aboutHeading}>📐 Weberの法則と難易度設計</Text>
          <Text style={styles.aboutBody}>
            「8と16の違い」は「1と2の違い」と同じ比率（1:2）のため、赤ちゃんが認識しやすいのは大きな数です。このアプリでは認識しやすい比率から段階的に難しくすることで、無理なく数の感覚を鍛えます。
          </Text>

          <View style={styles.aboutDivider} />

          <Text style={styles.aboutHeading}>⏱ なぜ1回40秒なのか</Text>
          <Text style={styles.aboutBody}>
            乳幼児の集中持続時間は約40秒とされています。短時間・高頻度（1日3回）のセッションが最も効率的に脳へ働きかけます。長くやるより、毎日続けることが重要です。
          </Text>

          <View style={styles.aboutDivider} />

          <Text style={styles.aboutHeading}>📅 178日間のプログラム構成</Text>
          <Text style={styles.aboutBody}>
            {'認識期（Day1〜50）：量を直感で感じる\n等式期（Day51〜100）：足し算・引き算を量で体験\n抽象化期（Day101〜140）：形を変えても同じ量と理解\n深化期（Day141〜178）：混合等式で総仕上げ'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFF',
  },
  navTitle: { fontSize: 17, fontWeight: '600', color: '#1A1A1A' },
  cancelText: { fontSize: 16, color: '#666' },
  saveText: { fontSize: 16, color: '#2196F3', fontWeight: '600' },
  saveTextDisabled: { color: '#AAA' },
  scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  scienceCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  scienceTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    lineHeight: 22,
  },
  scienceBody: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
  scienceSource: {
    fontSize: 11,
    color: '#AAA',
    marginTop: 8,
  },
  courseSuggestion: {
    backgroundColor: '#FFF8E1',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9800',
    gap: 10,
  },
  courseSuggestionText: {
    fontSize: 13,
    color: '#5D4037',
    lineHeight: 20,
  },
  courseSuggestionButton: {
    backgroundColor: '#FF9800',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  courseSuggestionButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 4,
  },
  rowSelected: { backgroundColor: '#E3F2FD' },
  rowLabel: { fontSize: 15, color: '#333' },
  checkmark: { fontSize: 16, color: '#2196F3', fontWeight: '700' },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 4,
  },
  testButton: {
    backgroundColor: '#E3F2FD',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  testButtonText: {
    fontSize: 14,
    color: '#1565C0',
    fontWeight: '600',
  },
  timeInput: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3',
    paddingVertical: 2,
    minWidth: 60,
    textAlign: 'center',
  },
  pickerRow: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 4,
    gap: 8,
  },
  pickerWrap: {
    marginTop: 4,
  },
  ageLabelText: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '600',
    marginLeft: 4,
    marginBottom: 4,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
  },
  badge: {
    alignItems: 'center',
    width: 72,
    padding: 8,
    borderRadius: 10,
  },
  badgeEarned: {
    backgroundColor: '#E3F2FD',
    opacity: 1,
  },
  badgeUnearned: {
    backgroundColor: '#F5F5F5',
    opacity: 0.3,
  },
  badgeEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  badgeLabel: {
    fontSize: 10,
    color: '#1565C0',
    fontWeight: '600',
    textAlign: 'center',
  },
  badgeLabelUnearned: {
    color: '#888',
  },
  aboutCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    gap: 4,
  },
  aboutHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 4,
    marginBottom: 6,
  },
  aboutBody: {
    fontSize: 13,
    color: '#555',
    lineHeight: 21,
  },
  aboutSource: {
    fontSize: 11,
    color: '#AAA',
    marginTop: 4,
  },
  aboutDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 12,
  },
});
