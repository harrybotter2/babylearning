import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';

interface YearMonthPickerProps {
  value: string; // 'YYYY-MM' or ''
  onChange: (value: string) => void;
  placeholder?: string;
}

const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

/**
 * 選択可能な年リストを生成する。
 * - 直近5年分（0〜48ヶ月の赤ちゃんをカバー）
 * - 保存済みの年が範囲外の場合も必ずリストに含める（年月変更時に消えない）
 */
function getYears(savedYear?: number | null): number[] {
  const current = new Date().getFullYear();
  const base = [current - 4, current - 3, current - 2, current - 1, current];
  if (savedYear && !base.includes(savedYear)) {
    return [...base, savedYear].sort((a, b) => a - b);
  }
  return base;
}

function parseValue(value: string): { year: number | null; month: number | null } {
  if (/^\d{4}-\d{2}$/.test(value)) {
    return { year: parseInt(value.split('-')[0]), month: parseInt(value.split('-')[1]) };
  }
  return { year: null, month: null };
}

function formatDisplay(value: string): string | null {
  const { year, month } = parseValue(value);
  if (year && month) return `${year}年 ${month}月`;
  return null;
}

export function YearMonthPicker({ value, onChange, placeholder = '年月を選ぶ' }: YearMonthPickerProps) {
  const { year: initYear, month: initMonth } = parseValue(value);
  // 保存済みの年を含めた動的な年リスト（コンポーネント再レンダリングのたびに最新化）
  const years = getYears(initYear);
  const [visible, setVisible] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | null>(initYear);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(initMonth);

  const displayValue = formatDisplay(value);

  const openPicker = () => {
    // Re-sync with current value when opening
    const { year, month } = parseValue(value);
    setSelectedYear(year);
    setSelectedMonth(month);
    setVisible(true);
  };

  const handleConfirm = () => {
    if (selectedYear && selectedMonth) {
      const mm = String(selectedMonth).padStart(2, '0');
      onChange(`${selectedYear}-${mm}`);
    }
    setVisible(false);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const canConfirm = selectedYear !== null && selectedMonth !== null;

  return (
    <>
      <TouchableOpacity style={styles.trigger} onPress={openPicker} activeOpacity={0.7}>
        <Text style={displayValue ? styles.triggerValue : styles.triggerPlaceholder}>
          {displayValue ?? placeholder}
        </Text>
        <Text style={styles.chevron}>▼</Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="slide" onRequestClose={handleCancel}>
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleCancel} />
          <View style={styles.sheet}>
            {/* Header */}
            <View style={styles.sheetHeader}>
              <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
                <Text style={styles.cancelText}>キャンセル</Text>
              </TouchableOpacity>
              <Text style={styles.sheetTitle}>生まれた年月</Text>
              <TouchableOpacity onPress={handleConfirm} disabled={!canConfirm} style={styles.headerButton}>
                <Text style={[styles.confirmText, !canConfirm && styles.confirmDisabled]}>
                  決定
                </Text>
              </TouchableOpacity>
            </View>

            {/* Year */}
            <Text style={styles.sectionLabel}>年</Text>
            <View style={styles.yearRow}>
              {years.map((year) => {
                const sel = selectedYear === year;
                return (
                  <TouchableOpacity
                    key={year}
                    style={[styles.yearChip, sel && styles.yearChipSelected]}
                    onPress={() => setSelectedYear(year)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.yearChipText, sel && styles.yearChipTextSelected]}>
                      {year}年
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Month */}
            <Text style={styles.sectionLabel}>月</Text>
            <View style={styles.monthGrid}>
              {MONTHS.map((label, i) => {
                const month = i + 1;
                const sel = selectedMonth === month;
                return (
                  <TouchableOpacity
                    key={month}
                    style={[styles.monthChip, sel && styles.monthChipSelected]}
                    onPress={() => setSelectedMonth(month)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.monthChipText, sel && styles.monthChipTextSelected]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {canConfirm && (
              <Text style={styles.previewText}>
                {selectedYear}年{selectedMonth}月生まれ
              </Text>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F7FF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#90CAF9',
  },
  triggerValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1565C0',
  },
  triggerPlaceholder: {
    fontSize: 15,
    color: '#90CAF9',
  },
  chevron: {
    fontSize: 10,
    color: '#90CAF9',
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerButton: {
    minWidth: 60,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  cancelText: {
    fontSize: 15,
    color: '#888',
  },
  confirmText: {
    fontSize: 15,
    color: '#2196F3',
    fontWeight: '700',
    textAlign: 'right',
  },
  confirmDisabled: {
    color: '#CCC',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    marginTop: 16,
    marginBottom: 8,
  },
  yearRow: {
    flexDirection: 'row',
    gap: 8,
  },
  yearChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  yearChipSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  yearChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  yearChipTextSelected: {
    color: '#1565C0',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  monthChip: {
    width: '22%',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  monthChipSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  monthChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  monthChipTextSelected: {
    color: '#1565C0',
  },
  previewText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '700',
  },
});
