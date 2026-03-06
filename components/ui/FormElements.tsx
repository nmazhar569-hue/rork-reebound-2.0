import React, { ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import colors, { borderRadius } from '@/constants/colors';
import { liquidGlass, glassShadows } from '@/constants/liquidGlass';

interface SelectionGroupProps<T> {
  label?: string;
  options: { label: string; value: T; description?: string }[];
  selectedValue: T | undefined;
  onSelect: (value: T) => void;
  style?: ViewStyle;
}

export function SelectionChips<T extends string | number>({
  label,
  options,
  selectedValue,
  onSelect,
  style,
}: SelectionGroupProps<T>) {
  return (
    <View style={[styles.selectionGroup, style]}>
      {label && <Text style={styles.groupLabel}>{label}</Text>}
      <View style={styles.chipsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={String(option.value)}
            style={[styles.chip, selectedValue === option.value && styles.chipSelected]}
            onPress={() => onSelect(option.value)}
          >
            <Text style={[styles.chipText, selectedValue === option.value && styles.chipTextSelected]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

interface SelectionListProps<T> {
  label?: string;
  hint?: string;
  options: { label: string; value: T; description?: string }[];
  selectedValue: T | undefined;
  onSelect: (value: T) => void;
  renderIcon?: (value: T, selected: boolean) => ReactNode;
  style?: ViewStyle;
}

export function SelectionList<T extends string | number>({
  label,
  hint,
  options,
  selectedValue,
  onSelect,
  renderIcon,
  style,
}: SelectionListProps<T>) {
  return (
    <View style={[styles.selectionGroup, style]}>
      {label && <Text style={styles.groupLabel}>{label}</Text>}
      {hint && <Text style={styles.groupHint}>{hint}</Text>}
      <View style={styles.listContainer}>
        {options.map((option) => {
          const isSelected = selectedValue === option.value;
          return (
            <TouchableOpacity
              key={String(option.value)}
              style={[styles.listItem, isSelected && styles.listItemSelected]}
              onPress={() => onSelect(option.value)}
            >
              {renderIcon && renderIcon(option.value, isSelected)}
              <View style={styles.listItemContent}>
                <Text style={[styles.listItemLabel, isSelected && styles.listItemLabelSelected]}>
                  {option.label}
                </Text>
                {option.description && (
                  <Text style={styles.listItemDescription}>{option.description}</Text>
                )}
              </View>
              {isSelected && <View style={styles.listItemCheck} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

interface InputFieldProps extends TextInputProps {
  label?: string;
  containerStyle?: ViewStyle;
}

export function InputField({ label, containerStyle, style, ...props }: InputFieldProps) {
  return (
    <View style={[styles.inputContainer, containerStyle]}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor={liquidGlass.text.tertiary}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  selectionGroup: {
    marginBottom: 20,
  },
  groupLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: liquidGlass.text.secondary,
    marginBottom: 12,
  },
  groupHint: {
    fontSize: 13,
    color: liquidGlass.text.tertiary,
    marginBottom: 12,
    marginTop: -8,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: liquidGlass.surface.glass,
    borderWidth: 1,
    borderColor: liquidGlass.border.glass,
  },
  chipSelected: {
    backgroundColor: liquidGlass.accent.primary,
    borderColor: liquidGlass.accent.primary,
  },
  chipText: {
    fontSize: 14,
    color: liquidGlass.text.primary,
    fontWeight: '500' as const,
  },
  chipTextSelected: {
    color: liquidGlass.text.inverse,
    fontWeight: '700' as const,
  },
  listContainer: {
    gap: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: liquidGlass.surface.card,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: liquidGlass.border.glass,
    ...glassShadows.soft,
  },
  listItemSelected: {
    borderColor: liquidGlass.accent.primary,
    backgroundColor: liquidGlass.accent.muted,
  },
  listItemContent: {
    flex: 1,
  },
  listItemLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: liquidGlass.text.primary,
  },
  listItemLabelSelected: {
    color: liquidGlass.accent.primary,
  },
  listItemDescription: {
    fontSize: 13,
    color: liquidGlass.text.tertiary,
    marginTop: 2,
  },
  listItemCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: liquidGlass.accent.primary,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: liquidGlass.text.secondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: liquidGlass.surface.card,
    borderWidth: 1,
    borderColor: liquidGlass.border.glass,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: liquidGlass.text.primary,
  },
});
