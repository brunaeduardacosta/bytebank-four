import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

interface Props {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  loading: boolean;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  colors: any;
}

export function ConfirmModal({
  visible,
  onCancel,
  onConfirm,
  loading,
  title,
  subtitle,
  children,
  colors,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          <View style={styles.summary}>{children}</View>

          <View style={styles.actions}>
            <TouchableOpacity onPress={onCancel} style={styles.cancel}>
              <Text>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onConfirm} style={styles.confirm}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: '#fff' }}>Salvar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    borderRadius: 20,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 15,
  },
  summary: {
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  cancel: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#eee',
    borderRadius: 12,
  },
  confirm: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#10B981',
    borderRadius: 12,
  },
});