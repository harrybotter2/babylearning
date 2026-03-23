import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StreakBadgeProps {
  streak: number;
}

export function StreakBadge({ streak }: StreakBadgeProps) {
  const isActive = streak > 0;

  return (
    <View style={[styles.container, isActive ? styles.active : styles.inactive]}>
      <Text style={styles.fire}>{isActive ? '🔥' : '💤'}</Text>
      <Text style={[styles.count, isActive ? styles.countActive : styles.countInactive]}>
        {streak}
      </Text>
      <Text style={styles.label}>日連続</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  active: {
    backgroundColor: '#FFF3CD',
  },
  inactive: {
    backgroundColor: '#F0F0F0',
  },
  fire: {
    fontSize: 20,
  },
  count: {
    fontSize: 24,
    fontWeight: '700',
  },
  countActive: {
    color: '#E07B00',
  },
  countInactive: {
    color: '#999',
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});
