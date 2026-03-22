import React, { useCallback } from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useDotGenerator } from '../hooks/useDotGenerator';

interface DotCanvasProps {
  count: number;
  color?: string;
  onLayout?: (width: number, height: number) => void;
  canvasWidth?: number;
  canvasHeight?: number;
}

const DOT_COLOR = '#E53935'; // 赤（高コントラスト）
const DEFAULT_WIDTH = 300;
const DEFAULT_HEIGHT = 500;

export function DotCanvas({
  count,
  color = DOT_COLOR,
  canvasWidth = DEFAULT_WIDTH,
  canvasHeight = DEFAULT_HEIGHT,
}: DotCanvasProps) {
  const { dots } = useDotGenerator(count, canvasWidth, canvasHeight);

  return (
    <View style={[styles.canvas, { width: canvasWidth, height: canvasHeight }]}>
      {dots.map((dot, index) => (
        <Animated.View
          key={index}
          entering={FadeIn.duration(80)}
          style={[
            styles.dot,
            {
              left: dot.x - dot.radius,
              top: dot.y - dot.radius,
              width: dot.radius * 2,
              height: dot.radius * 2,
              borderRadius: dot.radius,
              backgroundColor: color,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    backgroundColor: '#FFFFFF',
    position: 'relative',
    overflow: 'hidden',
  },
  dot: {
    position: 'absolute',
  },
});
