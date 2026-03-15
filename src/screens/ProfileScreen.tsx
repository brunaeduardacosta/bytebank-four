import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, 
  ActivityIndicator, Alert, Image, ScrollView, KeyboardAvoidingView, Platform 
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

// Firebase
import { updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, storage } from '../services/firebase';

import { useAuth } from '../context/AuthContext';

const COLORS = {
  primary: '#013D2D',
  accent: '#47A138',
  background: '#F8FAFC',
  card: '#FFFFFF',
  text: '#1F2937',
  subText: '#6B7280',
  border: '#E2E8F0',
  danger: '#EF4444'
};

export default function ProfileScreen({ navigation }: any) {
  const { user, signOut } = useAuth();
  
  const [nome, setNome] = useState(user?.displayName || '');
  const [photoUrl, setPhotoUrl] = useState(user?.photoURL || null);
  
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [isLoadingName, setIsLoadingName] = useState(false);

  const handleChangePhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return Alert.alert('Atenção', 'Precisamos de permissão para acessar a galeria.');
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], 
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.3,
    });

    if (!result.canceled && result.assets[0].uri && auth.currentUser) {
      setIsLoadingImage(true);
      try {
        const response = await fetch(result.assets[0].uri);
        const blob = await response.blob(); 

        const filename = `avatares/${auth.currentUser.uid}.jpg`;
        const storageRef = ref(storage, filename);
        
        await uploadBytes(storageRef, blob);
        const downloadUrl = await getDownloadURL(storageRef);

        await updateProfile(auth.currentUser, { photoURL: downloadUrl });
        
        setPhotoUrl(downloadUrl);
        Alert.alert('Sucesso!', 'Sua foto foi atualizada!');
      } catch (error) {
        console.error(error);
        Alert.alert('Erro', 'Não conseguimos processar essa imagem.');
      } finally {
        setIsLoadingImage(false);
      }
    }
  };

  const handleSaveName = async () => {
    if (!nome.trim()) return Alert.alert('Atenção', 'O nome não pode estar vazio.');
    if (nome === user?.displayName) return;

    setIsLoadingName(true);
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: nome.trim() });
        Alert.alert('Sucesso!', 'Nome atualizado com sucesso.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o nome.');
    } finally {
      setIsLoadingName(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        {/* CABEÇALHO (ESTILO EMPRÉSTIMO) */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={28} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Meu Perfil</Text>
          <View style={styles.spacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={handleChangePhoto} disabled={isLoadingImage} activeOpacity={0.8}>
              <View style={styles.avatarContainer}>
                {isLoadingImage ? (
                  <ActivityIndicator size="large" color={COLORS.accent} />
                ) : photoUrl ? (
                  <Image source={{ uri: photoUrl }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarInitials}>
                    {nome ? nome.charAt(0).toUpperCase() : 'U'}
                  </Text>
                )}
                <View style={styles.editBadge}>
                  <MaterialCommunityIcons name="camera" size={16} color="#FFF" />
                </View>
              </View>
            </TouchableOpacity>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Dados Pessoais</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome de exibição</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={nome}
                  onChangeText={setNome}
                  placeholder="Como quer ser chamado?"
                />
                <TouchableOpacity onPress={handleSaveName} disabled={isLoadingName} style={styles.saveBtnInline}>
                  {isLoadingName ? (
                    <ActivityIndicator size="small" color={COLORS.accent} />
                  ) : (
                    <Text style={styles.saveBtnText}>Salvar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>E-mail de acesso</Text>
              <View style={[styles.inputWrapper, { backgroundColor: '#F1F5F9' }]}>
                <TextInput
                  style={[styles.input, { color: COLORS.subText }]}
                  value={user?.email || ''}
                  editable={false}
                />
                <MaterialCommunityIcons name="lock" size={20} color={COLORS.subText} style={{ marginRight: 15 }} />
              </View>
            </View>
          </View>

          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Conta</Text>
            <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
              <MaterialCommunityIcons name="logout" size={24} color={COLORS.danger} />
              <Text style={styles.logoutText}>Sair da conta</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingVertical: 15, 
    backgroundColor: COLORS.card, 
    borderBottomWidth: 1, 
    borderBottomColor: COLORS.border 
  },
  backButton: { width: 32, height: 32, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  spacer: { width: 32 }, // Garante a centralização perfeita do título
  content: { padding: 20 },
  
  avatarSection: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
  avatarContainer: { width: 110, height: 110, borderRadius: 55, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5 },
  avatarImage: { width: '100%', height: '100%', borderRadius: 55 },
  avatarInitials: { fontSize: 40, fontWeight: 'bold', color: '#FFF' },
  editBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: COLORS.accent, width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: COLORS.background },
  userEmail: { marginTop: 15, fontSize: 14, color: COLORS.subText, fontWeight: '500' },

  formSection: { marginBottom: 30 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.text, marginBottom: 15 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.subText, marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, overflow: 'hidden' },
  input: { flex: 1, padding: 15, fontSize: 16, color: COLORS.text },
  saveBtnInline: { paddingHorizontal: 15, justifyContent: 'center' },
  saveBtnText: { color: COLORS.accent, fontWeight: 'bold', fontSize: 14 },

  settingsSection: { marginBottom: 40 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#FECACA' },
  logoutText: { color: COLORS.danger, fontSize: 16, fontWeight: 'bold', marginLeft: 10 }
});