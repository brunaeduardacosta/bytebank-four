import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'; // Para navegar sem passar props
import { useAuth } from '../../context/AuthContext'; // Para pegar a foto real

interface NavbarProps {
  theme: any;
}

const Navbar: React.FC<NavbarProps> = ({ theme }) => {
  const { user } = useAuth();
  const navigation = useNavigation<any>();

  // Pegamos a inicial do nome real ou 'A' de Arthur
  const userInitial = user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'A';

  return (
    <View style={[navStyles.topbar, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
      <View style={navStyles.topbarInner}>
        
        {/* LADO ESQUERDO: LOGO (Centralizado ou à esquerda, conforme sua preferência) */}
        <View style={navStyles.leftSection}>
          <MaterialCommunityIcons name="shield-check" size={24} color={theme.accent} />
          <Text style={[navStyles.logoText, { color: theme.text }]}>
            BYTE<Text style={{ color: theme.accent }}>BANK</Text>
          </Text>
        </View>

        {/* LADO DIREITO: NOTIFICAÇÕES + PERFIL */}
        <View style={navStyles.rightSection}>
          
          {/* Notificações */}
          <TouchableOpacity style={navStyles.iconBtn} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={24} color={theme.text} />
            <View style={navStyles.notifDot} />
          </TouchableOpacity>

          {/* AVATAR DO USUÁRIO (CLICÁVEL) */}
          <TouchableOpacity 
            style={navStyles.profileBtn} 
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.8}
          >
            <View style={[navStyles.userAvatar, { borderColor: theme.border }]}>
              {user?.photoURL ? (
                <Image source={{ uri: user.photoURL }} style={navStyles.avatarImage} />
              ) : (
                <View style={[navStyles.avatarFallback, { backgroundColor: theme.accent }]}>
                  <Text style={navStyles.avatarText}>{userInitial}</Text>
                </View>
              )}
            </View>
            {/* Indicador de que é um menu/clicável */}
            <Ionicons name="chevron-down" size={12} color={theme.subText} style={navStyles.chevron} />
          </TouchableOpacity>

        </View>
      </View>
    </View>
  );
};

const navStyles = StyleSheet.create({
  topbar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 110 : 90,
    borderBottomWidth: 1,
    paddingTop: Platform.OS === 'ios' ? 45 : 25,
    justifyContent: 'center',
    zIndex: 1000, 
    elevation: 10, 
  },
  topbarInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  leftSection: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  logoText: { fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  
  rightSection: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: { padding: 4 },
  notifDot: { 
    position: 'absolute', 
    top: 4, 
    right: 4, 
    width: 8, 
    height: 8, 
    backgroundColor: '#EF4444', 
    borderRadius: 4, 
    borderWidth: 1.5, 
    borderColor: '#FFF' 
  },

  // Estilo do Perfil no Navbar
  profileBtn: { flexDirection: 'row', alignItems: 'flex-end', marginLeft: 5 },
  userAvatar: { 
    width: 38, 
    height: 38, 
    borderRadius: 12, 
    borderWidth: 1, 
    overflow: 'hidden',
    backgroundColor: '#F1F5F9'
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarFallback: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  chevron: { marginLeft: -6, marginBottom: -2, backgroundColor: '#F8FAFC', borderRadius: 10 }
});

export default Navbar;