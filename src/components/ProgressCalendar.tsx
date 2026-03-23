import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getPhase, Phase } from '../data/curriculum';

interface ProgressCalendarProps {
  totalDays: number;
  currentDay: number;
  completedDays: Set<number>;
}

const CELL_SIZE = 14;
const CELL_GAP = 2;
const COLS = 20;

const PHASE_COLORS: Record<Phase, string> = {
  recognition: '#2196F3', // 認識期: 青 (Day 1-50)
  equation:    '#9C27B0', // 等式期: 紫 (Day 51-100)
  abstraction: '#FF9800', // 抽象期: オレンジ (Day 101-140)
  deepening:   '#E91E63', // 深化期: ピンク (Day 141-178)
};

export function ProgressCalendar({ totalDays, currentDay, completedDays }: ProgressCalendarProps) {
  const rows: number[][] = [];
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);

  for (let i = 0; i < days.length; i += COLS) {
    rows.push(days.slice(i, i + COLS));
  }

  const completedCount = completedDays.size;
  const pct = Math.round((completedCount / totalDays) * 100);
  const encouragement =
    completedCount === 0
      ? 'はじめの一歩を踏み出しましょう'
      : pct < 10
        ? '順調なスタートです！'
        : pct < 30
          ? 'いいペースです！続けましょう'
          : pct < 60
            ? 'すごい！習慣になってきましたね'
            : pct < 90
              ? 'もうすぐゴールが見えてきました！'
              : '完走まであと少しです！';

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{completedCount} / {totalDays} 日</Text>
        <Text style={styles.pct}>{pct}%</Text>
      </View>
      <Text style={styles.encouragement}>{encouragement}</Text>
      <View style={styles.grid}>
        {rows.map((row, rowIdx) => (
          <View key={rowIdx} style={styles.row}>
            {row.map((day) => {
              const phase = getPhase(day);
              const phaseColor = PHASE_COLORS[phase];
              const isCompleted = completedDays.has(day);
              const isCurrent = day === currentDay;
              return (
                <View
                  key={day}
                  style={[
                    styles.cell,
                    isCompleted
                      ? { backgroundColor: phaseColor }
                      : isCurrent
                        ? { backgroundColor: phaseColor, opacity: 0.5, borderWidth: 1.5, borderColor: phaseColor }
                        : day < currentDay
                          ? styles.skipped
                          : styles.future,
                  ]}
                />
              );
            })}
          </View>
        ))}
      </View>

      {/* フェーズ凡例 */}
      <View style={styles.legend}>
        {(Object.entries(PHASE_COLORS) as [Phase, string][]).map(([phase, color]) => (
          <View key={phase} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: color }]} />
            <Text style={styles.legendText}>
              {phase === 'recognition' ? '認識期' : phase === 'equation' ? '等式期' : phase === 'abstraction' ? '抽象期' : '深化期'}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  pct: {
    fontSize: 13,
    color: '#2196F3',
    fontWeight: '600',
  },
  encouragement: {
    fontSize: 12,
    color: '#888',
  },
  grid: {
    gap: CELL_GAP,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    gap: CELL_GAP,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 3,
  },
  completed: {
    backgroundColor: '#4CAF50',
  },
  current: {
    backgroundColor: '#2196F3',
  },
  skipped: {
    backgroundColor: '#E0E0E0',
  },
  future: {
    backgroundColor: '#EEEEEE',
  },
  legend: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
    color: '#888',
  },
});
