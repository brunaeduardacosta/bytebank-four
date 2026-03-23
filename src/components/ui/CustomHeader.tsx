import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  title: string;
  rightIcon?: keyof typeof Ionicons.prototype.name; // Ícone opcional à direita
  onRightPress?: () => void;
}

export default function CustomHeader({ title, rightIcon, onRightPress }: Props) {
  const navigation = useNavigation();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.button}>
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>

      <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
        {title}
      </Text>

      <View style={styles.button}>
        {rightIcon && (
          <TouchableOpacity onPress={onRightPress}>
            <Ionicons name={rightIcon as any} size={28} color={colors.accent} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56, // Altura padrão do Material Design (ajusta o problema de estar "alta")
    paddingHorizontal: 15,
    borderBottomWidth: 0.5,
  },
  button: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
});