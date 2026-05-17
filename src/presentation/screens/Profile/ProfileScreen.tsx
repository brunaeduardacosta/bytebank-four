import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Modal, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import { SafeAreaView } from 'react-native-safe-area-context'; // Import correto

// Firebase
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile, sendPasswordResetEmail, getAuth } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../../../infrastructure/firebase/firebase';

import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../contexts/ThemeContext';

export default function ProfileScreen({ navigation }: any) {
  const { user, signOut } = useAuth();
  const auth = getAuth();
  const { theme, colors, toggleTheme } = useTheme(); 
  
  const [ocupacao, setOcupacao] = useState('Carregando...');
  const [modalVisible, setModalVisible] = useState(false);
  const [editType, setEditType] = useState<'nome' | 'ocupacao'>('nome');
  const [inputValue, setInputValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const [photoUrl, setPhotoUrl] = useState<string | null>(user?.photoURL || null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().ocupacao) {
            setOcupacao(docSnap.data().ocupacao);
          } else {
            setOcupacao('Não informada');
          }
        } catch (error) {
          setOcupacao('Erro ao carregar');
        }
      }
    };
    fetchUserData();
  }, [user]);

  const firstName = user?.displayName ? user.displayName.split(' ')[0] : 'Usuário';

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permissão negada', 'Precisamos de acesso à sua galeria para mudar a foto.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      uploadPhotoToFirebase(result.assets[0].uri);
    }
  };

  const uploadPhotoToFirebase = async (uri: string) => {
    if (!user) return;
    setIsUploadingPhoto(true);
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const storage = getStorage();
      const storageRef = ref(storage, `avatars/${user.uid}`);
      await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(storageRef);
      await updateProfile(user, { photoURL: downloadUrl });
      setPhotoUrl(downloadUrl);
      Alert.alert("Sucesso!", "Sua foto de perfil foi atualizada.");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar a foto.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const openEditModal = (type: 'nome' | 'ocupacao', currentValue: string) => {
    setEditType(type);
    setInputValue(currentValue !== 'Não informada' && currentValue !== 'Carregando...' ? currentValue : '');
    setModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!inputValue.trim() || !user) return;
    setIsSaving(true);
    try {
      if (editType === 'nome') {
        await updateProfile(user, { displayName: inputValue });
        Alert.alert("Sucesso", "Nome atualizado!");
      } else if (editType === 'ocupacao') {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { ocupacao: inputValue });
        setOcupacao(inputValue);
      }
      setModalVisible(false);
    } catch (error) {
      Alert.alert("Erro", "Falha ao salvar.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;
    try {
      await sendPasswordResetEmail(auth, user.email);
      Alert.alert("E-mail enviado!", "Verifique seu e-mail para redefinir a senha.");
    } catch (error) {
      Alert.alert("Erro", "Falha ao enviar e-mail.");
    }
  };

  const SettingsItem = ({ icon, title, value, onPress, isSwitch, switchValue, onSwitchChange, isDestructive }: any) => (
    <TouchableOpacity 
      style={[styles.settingsItem, { borderBottomColor: colors.border }]} 
      activeOpacity={isSwitch ? 1 : 0.7} 
      onPress={onPress} 
      disabled={isSwitch}
    >
      <View style={styles.itemLeft}>
        <View style={[styles.iconWrapper, { backgroundColor: isDestructive ? 'rgba(220, 38, 38, 0.1)' : colors.background }]}>
          <Ionicons name={icon} size={20} color={isDestructive ? '#DC2626' : colors.textSecondary} />
        </View>
        <Text style={[styles.itemTitle, { color: isDestructive ? '#DC2626' : colors.text }]}>{title}</Text>
      </View>
      <View style={styles.itemRight}>
        {value && <Text style={[styles.itemValue, { color: colors.textSecondary }]} numberOfLines={1}>{value}</Text>}
        {isSwitch ? (
          <Switch value={switchValue} onValueChange={onSwitchChange} trackColor={{ false: colors.border, true: colors.accent }} thumbColor={'#FFF'} />
        ) : (
          !isDestructive && <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      
      {/* HEADER PADRONIZADO (60px) */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Meu Perfil</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        <View style={styles.profileHeader}>
          <TouchableOpacity onPress={handlePickImage} disabled={isUploadingPhoto} style={styles.avatarButton}>
            <View style={[styles.avatarCircle, { backgroundColor: colors.accent, overflow: 'hidden' }]}>
              {isUploadingPhoto ? (
                <ActivityIndicator size="large" color="#FFF" />
              ) : photoUrl ? (
                <Image source={{ uri: photoUrl }} style={{ width: '100%', height: '100%' }} />
              ) : (
                <Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase()}</Text>
              )}
            </View>
            <View style={[styles.editBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="camera" size={14} color={colors.text} />
            </View>
          </TouchableOpacity>
          <Text style={[styles.profileName, { color: colors.text }]}>{user?.displayName || 'Usuário'}</Text>
          <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{user?.email}</Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Dados Pessoais</Text>
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingsItem icon="person-outline" title="Nome" value={user?.displayName || 'Não informado'} onPress={() => openEditModal('nome', user?.displayName || '')} />
          <SettingsItem icon="briefcase-outline" title="Ocupação" value={ocupacao} onPress={() => openEditModal('ocupacao', ocupacao)} />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Segurança</Text>
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingsItem icon="mail-outline" title="E-mail" value={user?.email} onPress={() => Alert.alert("Aviso", "Alteração via suporte.")} />
          <SettingsItem icon="lock-closed-outline" title="Redefinir Senha" onPress={handleResetPassword} />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Preferências</Text>
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingsItem icon="moon-outline" title="Modo Escuro" isSwitch={true} switchValue={theme === 'dark'} onSwitchChange={toggleTheme} />
        </View>

        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 10 }]}>
          <SettingsItem icon="log-out-outline" title="Sair da Conta" isDestructive={true} onPress={signOut} />
        </View>

      </ScrollView>

      <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Editar {editType === 'nome' ? 'Nome' : 'Ocupação'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              value={inputValue}
              onChangeText={setInputValue}
              placeholder={`Digite o novo ${editType}`}
              placeholderTextColor={colors.textSecondary}
              autoFocus
            />
            <TouchableOpacity style={[styles.modalSaveBtn, { backgroundColor: colors.accent }]} onPress={handleSaveEdit} disabled={isSaving}>
              {isSaving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.modalSaveBtnText}>Salvar</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    height: 60, 
    paddingHorizontal: 15, 
    borderBottomWidth: 1 
  },
  headerBtn: { width: 40, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 20, paddingBottom: 60 },
  profileHeader: { alignItems: 'center', marginBottom: 35, marginTop: 10 },
  avatarButton: { position: 'relative', marginBottom: 15 },
  avatarCircle: { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
  avatarText: { fontSize: 36, fontWeight: 'bold', color: '#FFF' },
  editBadge: { position: 'absolute', bottom: 2, right: 2, width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
  profileName: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  profileEmail: { fontSize: 14, opacity: 0.7 },
  sectionTitle: { fontSize: 11, fontWeight: '900', textTransform: 'uppercase', marginBottom: 10, marginLeft: 10, letterSpacing: 1 },
  sectionCard: { borderRadius: 24, overflow: 'hidden', marginBottom: 25, borderWidth: 1 },
  settingsItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18, borderBottomWidth: 1 },
  itemLeft: { flexDirection: 'row', alignItems: 'center' },
  iconWrapper: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  itemTitle: { fontSize: 16, fontWeight: '600' },
  itemRight: { flexDirection: 'row', alignItems: 'center' },
  itemValue: { fontSize: 14, marginRight: 8, maxWidth: 130 },
  modalOverlay: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { borderRadius: 28, padding: 25 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  modalInput: { borderWidth: 1, borderRadius: 16, padding: 16, fontSize: 16, marginBottom: 20 },
  modalSaveBtn: { padding: 18, borderRadius: 16, alignItems: 'center' },
  modalSaveBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});