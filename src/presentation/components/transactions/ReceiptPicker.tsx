import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  image?: string | null;
  onPick: () => void;
  onRemove: () => void;
  colors: any;
}

export function ReceiptPicker({ image, onPick, onRemove, colors }: Props) {
  return (
    <View>
      {image ? (
        <View style={styles.imageWrapper}>
          <Image source={{ uri: image }} style={styles.image} />

          <TouchableOpacity style={styles.removeBtn} onPress={onRemove}>
            <Ionicons name="trash" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.placeholder, { borderColor: colors.border }]}
          onPress={onPick}
        >
          <Ionicons name="camera-outline" size={28} color={colors.textSecondary} />
          <Text style={{ marginTop: 8, color: colors.textSecondary }}>
            Toque para anexar
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  imageWrapper: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 20,
  },
  placeholder: {
    height: 100,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
});