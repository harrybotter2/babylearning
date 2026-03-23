import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppSettings, DEFAULT_SETTINGS } from '../hooks/useSettings';
import { CourseId } from '../hooks/useLesson';
import { isValidTimeString } from '../utils/notifications';
import { calcAgeMonths, ageMonthsToCourseId } from '../utils/babyAge';
import { YearMonthPicker } from '../components/YearMonthPicker';

interface OnboardingScreenProps {
  onComplete: (settings: AppSettings) => void;
}

const COURSES: { id: CourseId; ageLabel: string; speedLabel: string; emoji: string }[] = [
  { id: '0-6M', ageLabel: '0〜6ヶ月', speedLabel: 'ゆっくり（1.5秒）', emoji: '🌱' },
  { id: '6-18M', ageLabel: '6〜18ヶ月', speedLabel: 'スタンダード（1.0秒）', emoji: '🌿' },
  { id: '18-36M', ageLabel: '18〜36ヶ月', speedLabel: 'はやめ（0.7秒）', emoji: '🌳' },
];

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [step, setStep] = useState(0);
  const [courseId, setCourseId] = useState<CourseId>(DEFAULT_SETTINGS.courseId);
  const [babyBirthDate, setBabyBirthDate] = useState<string | null>(null);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [notifTime, setNotifTime] = useState('09:00');
  const [timeError, setTimeError] = useState('');

  const handleSelectBirthDate = (date: string) => {
    setBabyBirthDate(date);
    const months = calcAgeMonths(date);
    const computedCourseId = ageMonthsToCourseId(months);
    setCourseId(computedCourseId);
  };

  const handleStart = () => {
    if (notifEnabled && !isValidTimeString(notifTime)) {
      setTimeError('HH:MM形式で入力してください（例: 09:00）');
      return;
    }
    onComplete({
      courseId,
      soundEnabled: true,
      notificationTime: notifEnabled ? notifTime : null,
      babyBirthDate: babyBirthDate,
      onboardingCompleted: true,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* ステップインジケーター */}
      <View style={styles.stepDots}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
        ))}
      </View>

      {step === 0 && <WelcomeStep onNext={() => setStep(1)} />}
      {step === 1 && (
        <CourseStep
          courseId={courseId}
          onSelect={setCourseId}
          onNext={() => setStep(2)}
          babyBirthDate={babyBirthDate ?? ''}
          onSelectBirthDate={handleSelectBirthDate}
        />
      )}
      {step === 2 && (
        <NotifStep
          notifEnabled={notifEnabled}
          notifTime={notifTime}
          timeError={timeError}
          onToggle={setNotifEnabled}
          onChangeTime={(t) => {
            setNotifTime(t);
            setTimeError('');
          }}
          onStart={handleStart}
        />
      )}
    </SafeAreaView>
  );
}

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <ScrollView contentContainerStyle={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.dotsIllustration}>{'●●●\n●●●●●●\n●●●'}</Text>
      <Text style={styles.welcomeTitle}>{'赤ちゃんの「数の感覚」を\n一緒に育てましょう'}</Text>
      <Text style={styles.welcomeBody}>
        生まれた瞬間から、赤ちゃんは数を感じ取れます。
        毎日わずか40秒のドッツカードが、将来の算数力の土台になります。
      </Text>

      <View style={styles.featureList}>
        <FeatureRow icon="⏱" text="1日40秒以内。忙しいママ・パパでも続けられます" />
        <FeatureRow icon="🧠" text="認知科学に基づいた設計。「見せるだけ」でOK" />
        <FeatureRow icon="📵" text="完全オフライン。ネット不要で安心" />
        <FeatureRow icon="🔒" text="データはこのスマートフォンのみに保存されます" />
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={onNext} activeOpacity={0.8}>
        <Text style={styles.primaryButtonText}>はじめる</Text>
      </TouchableOpacity>

      <Text style={styles.disclaimer}>
        ※ 認知科学の研究（Izard et al. 2009 / Weber の法則）に基づいて設計しています。
      </Text>
    </ScrollView>
  );
}

function FeatureRow({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.featureRow}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

function CourseStep({
  courseId,
  onSelect,
  onNext,
  babyBirthDate,
  onSelectBirthDate,
}: {
  courseId: CourseId;
  onSelect: (id: CourseId) => void;
  onNext: () => void;
  babyBirthDate: string;
  onSelectBirthDate: (date: string) => void;
}) {
  const [autoSelected, setAutoSelected] = useState(false);

  const handleBirthDateChange = (value: string) => {
    setAutoSelected(false);
    onSelectBirthDate(value);
    setAutoSelected(true);
  };

  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>{'お子さんの月齢を\n教えてください'}</Text>
      <Text style={styles.stepSubtitle}>
        {'月齢に合ったスピードで点滅させます。\n後から設定で変更できます。'}
      </Text>

      {/* 生年月選択 */}
      <View style={styles.birthDateSection}>
        <Text style={styles.birthDateLabel}>赤ちゃんの生まれた年月（任意）</Text>
        <YearMonthPicker
          value={babyBirthDate}
          onChange={handleBirthDateChange}
          placeholder="タップして選択"
        />
        {autoSelected && babyBirthDate && (
          <Text style={styles.autoSelectedText}>月齢から自動でコースを選びました</Text>
        )}
      </View>

      <View style={styles.courseCards}>
        {COURSES.map((course) => {
          const selected = courseId === course.id;
          return (
            <TouchableOpacity
              key={course.id}
              style={[styles.courseCard, selected && styles.courseCardSelected]}
              onPress={() => onSelect(course.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.courseEmoji}>{course.emoji}</Text>
              <View style={styles.courseInfo}>
                <Text style={[styles.courseAge, selected && styles.courseAgeSelected]}>
                  {course.ageLabel}
                </Text>
                <Text style={styles.courseSpeed}>{course.speedLabel}</Text>
              </View>
              {selected && <Text style={styles.courseCheck}>✓</Text>}
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={onNext} activeOpacity={0.8}>
        <Text style={styles.primaryButtonText}>次へ</Text>
      </TouchableOpacity>
    </View>
  );
}

function NotifStep({
  notifEnabled,
  notifTime,
  timeError,
  onToggle,
  onChangeTime,
  onStart,
}: {
  notifEnabled: boolean;
  notifTime: string;
  timeError: string;
  onToggle: (v: boolean) => void;
  onChangeTime: (v: string) => void;
  onStart: () => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>毎日のリマインダー</Text>
      <Text style={styles.stepSubtitle}>
        {'習慣化のコツは「同じ時間に行うこと」。\n通知で毎日思い出せます。'}
      </Text>

      <View style={styles.notifCard}>
        <View style={styles.notifRow}>
          <View>
            <Text style={styles.notifLabel}>通知を受け取る</Text>
            <Text style={styles.notifSub}>後から設定で変更できます</Text>
          </View>
          <Switch
            value={notifEnabled}
            onValueChange={onToggle}
            trackColor={{ false: '#E0E0E0', true: '#90CAF9' }}
            thumbColor={notifEnabled ? '#2196F3' : '#FFF'}
          />
        </View>

        {notifEnabled && (
          <View style={styles.timeRow}>
            <Text style={styles.notifLabel}>通知時刻</Text>
            <TextInput
              style={[styles.timeInput, timeError ? styles.timeInputError : null]}
              value={notifTime}
              onChangeText={onChangeTime}
              placeholder="09:00"
              keyboardType="numbers-and-punctuation"
              maxLength={5}
            />
          </View>
        )}
        {!!timeError && <Text style={styles.errorText}>{timeError}</Text>}
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={onStart} activeOpacity={0.8}>
        <Text style={styles.primaryButtonText}>Science Dots をはじめる 🎉</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onStart} style={styles.skipButton}>
        <Text style={styles.skipText}>通知なしではじめる</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  stepDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 12,
    paddingBottom: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#DDD',
  },
  dotActive: {
    backgroundColor: '#2196F3',
    width: 18,
    borderRadius: 3,
  },
  stepContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingBottom: 32,
  },
  dotsIllustration: {
    fontSize: 28,
    color: '#E53935',
    letterSpacing: 4,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 20,
    lineHeight: 40,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 16,
  },
  welcomeBody: {
    fontSize: 15,
    color: '#555',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 28,
  },
  featureList: {
    gap: 10,
    marginBottom: 32,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
  },
  featureIcon: {
    fontSize: 20,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  disclaimer: {
    fontSize: 11,
    color: '#AAA',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 16,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    lineHeight: 32,
    marginTop: 20,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  birthDateSection: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    gap: 8,
  },
  birthDateLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  birthDateInput: {
    fontSize: 16,
    color: '#1A1A1A',
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3',
    paddingVertical: 4,
  },
  autoSelectedText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  courseCards: {
    gap: 10,
    marginBottom: 32,
  },
  courseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    gap: 12,
  },
  courseCardSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  courseEmoji: {
    fontSize: 28,
  },
  courseInfo: {
    flex: 1,
  },
  courseAge: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  courseAgeSelected: {
    color: '#1565C0',
  },
  courseSpeed: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  courseCheck: {
    fontSize: 18,
    color: '#2196F3',
    fontWeight: '700',
  },
  notifCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    gap: 12,
    marginBottom: 28,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notifLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  notifSub: {
    fontSize: 12,
    color: '#AAA',
    marginTop: 2,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  timeInput: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3',
    paddingVertical: 4,
    minWidth: 70,
    textAlign: 'center',
  },
  timeInputError: {
    borderBottomColor: '#F44336',
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  skipText: {
    fontSize: 14,
    color: '#AAA',
  },
  primaryButton: {
    backgroundColor: '#2196F3',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
