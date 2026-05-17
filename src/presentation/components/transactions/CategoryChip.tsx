import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
  label: string;
  icon: string;
  selected: boolean;
  color: string;
  background: string;
  onPress: () => void;
}

export function CategoryChip({
  label,
  icon,
  selected,
  color,
  background,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: selected ? background : '#fff',
          borderColor: selected ? color : '#ddd',
        },
      ]}
    >
      <MaterialCommunityIcons
        name={icon as any}
        size={20}
        color={selected ? color : '#888'}
      />
      <Text style={[styles.text, { color: selected ? color : '#666' }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '48%',
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  text: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '700',
  },
});