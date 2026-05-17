import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

interface Props {
  value: string;
  displayValue: string;
  color: string;
  onChange: (text: string) => void;
}

export function CurrencyInput({
  value,
  displayValue,
  color,
  onChange,
}: Props) {
  return (
    <TextInput
      style={[styles.input, { color }]}
      value={displayValue}
      onChangeText={onChange}
      keyboardType="numeric"
      placeholder="R$ 0,00"
      placeholderTextColor={`${color}40`}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    fontSize: 36,
    fontWeight: '800',
  },
});