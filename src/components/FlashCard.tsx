import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, { FadeIn, FadeOut, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { DotCanvas } from './DotCanvas';
import { LessonCard } from '../hooks/useLesson';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FlashCardProps {
  cards: LessonCard[];
  onComplete: () => void;
}

/**
 * フラッシュカードを順番に表示するコンポーネント。
 * 各カードは flashSpeedMs ミリ秒ごとに自動的に次に進む。
 */
export function FlashCard({ cards, onComplete }: FlashCardProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const advance = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev + 1 >= cards.length) {
        onComplete();
        return prev;
      }
      return prev + 1;
    });
  }, [cards.length, onComplete]);

  useEffect(() => {
    if (cards.length === 0) return;
    const card = cards[currentIndex];
    timerRef.current = setTimeout(advance, card.flashSpeedMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentIndex, cards, advance]);

  if (cards.length === 0) return null;

  const card = cards[currentIndex];

  return (
    <View style={styles.container}>
      <Animated.View key={currentIndex} entering={FadeIn.duration(60)} exiting={FadeOut.duration(60)} style={styles.card}>
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
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${((currentIndex + 1) / cards.length) * 100}%` },
          ]}
        />
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
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
  },
  progressFill: {
    height: 4,
    backgroundColor: '#1565C0',
  },
});
