import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import * as Speech from 'expo-speech';
import { DotCanvas } from './DotCanvas';
import { LessonCard } from '../hooks/useLesson';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FlashCardProps {
  cards: LessonCard[];
  soundEnabled: boolean;
  onComplete: () => void;
}

/**
 * フラッシュカードを順番に表示するコンポーネント。
 * 各カードは「音声読み上げ完了」と「最小表示時間（flashSpeedMs）」の
 * 両方が揃ってから次に進む。これにより音声と画面の整合性を保証する。
 */
export function FlashCard({ cards, soundEnabled, onComplete }: FlashCardProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const advance = useCallback(() => {
    setCurrentIndex((prev) => {
      const next = prev + 1;
      if (next >= cards.length) {
        onComplete();
        return prev;
      }
      return next;
    });
  }, [cards, onComplete]);

  useEffect(() => {
    if (cards.length === 0) return;

    const card = cards[currentIndex];

    // 音声とタイマーの両方が完了してから次へ進む
    let cancelled = false;
    // dotsカード以外は音声なし
    let speechDone = !soundEnabled || card.type !== 'dots';
    let timerDone = false;

    const tryAdvance = () => {
      if (cancelled || !speechDone || !timerDone) return;
      cancelled = true; // 二重進行を防止
      advance();
    };

    // 最小表示時間タイマー
    timerRef.current = setTimeout(() => {
      timerDone = true;
      tryAdvance();
    }, card.flashSpeedMs);

    // 音声読み上げ（dotsカードのみ）
    if (!speechDone) {
      Speech.speak(String(card.count), {
        language: 'ja',
        onDone: () => {
          speechDone = true;
          tryAdvance();
        },
        onError: () => {
          // 音声エラー時はタイマーのみで進む
          speechDone = true;
          tryAdvance();
        },
      });
    }

    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
      Speech.stop();
    };
  }, [currentIndex, cards, soundEnabled, advance]);

  if (cards.length === 0) return null;

  const card = cards[currentIndex];

  return (
    <View style={styles.container}>
      <Animated.View
        key={currentIndex}
        entering={FadeIn.duration(60)}
        exiting={FadeOut.duration(60)}
        style={styles.card}
      >
        {card.type === 'dots' ? (
          <DotCanvas
            count={card.count}
            canvasWidth={SCREEN_WIDTH}
            canvasHeight={SCREEN_HEIGHT * 0.7}
          />
        ) : (
          <EquationDisplay card={card} />
        )}
      </Animated.View>

      {/* 進捗インジケーター */}
      <View style={styles.progressFooter}>
        <Text style={styles.cardCounter}>{currentIndex + 1} / {cards.length}</Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentIndex + 1) / cards.length) * 100}%` },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

function EquationDisplay({ card }: { card: LessonCard }) {
  return (
    <View style={styles.equationContainer}>
      <View style={styles.equationRow}>
        <DotCanvas count={card.operandA!} canvasWidth={140} canvasHeight={200} />
        <Text style={styles.operator}>{card.operator}</Text>
        <DotCanvas count={card.operandB!} canvasWidth={140} canvasHeight={200} />
        <Text style={styles.operator}>=</Text>
        <DotCanvas count={card.result!} canvasWidth={140} canvasHeight={200} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  card: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  equationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  equationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  operator: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1565C0',
  },
  progressFooter: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 4,
  },
  cardCounter: {
    fontSize: 12,
    color: '#BBB',
    textAlign: 'right',
    fontWeight: '600',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },
  progressFill: {
    height: 4,
    backgroundColor: '#1565C0',
    borderRadius: 2,
  },
});
