import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  theme: any;
}

const Navbar: React.FC<NavbarProps> = ({ theme }) => {
  const { user } = useAuth();
  const navigation = useNavigation<any>();

  const userInitial = user?.displayName
    ? user.displayName.charAt(0).toUpperCase()
    : 'A';

  return (
    <View style={[navStyles.topbar, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
      <View style={navStyles.topbarInner}>

        {/* LADO ESQUERDO */}
        <View style={navStyles.leftSection}>
          <MaterialCommunityIcons name="shield-check" size={24} color={theme.accent} />

          {/* LOGO CORRIGIDO */}
          <View style={{ flexDirection: 'row' }}>
            <Text style={[navStyles.logoText, { color: theme.text }]}>BYTE</Text>
            <Text style={[navStyles.logoText, { color: theme.accent }]}>BANK</Text>
          </View>
        </View>

        {/* LADO DIREITO */}
        <View style={navStyles.rightSection}>
          
          {/* NOTIFICAÇÕES */}
          <TouchableOpacity style={navStyles.iconBtn} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={24} color={theme.text} />
            <View style={navStyles.notifDot} />
          </TouchableOpacity>

          {/* PERFIL */}
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
                  <Text style={navStyles.avatarText}>
                    {String(userInitial)}
                  </Text>
                </View>
              )}
            </View>

            <Ionicons
              name="chevron-down"
              size={12}
              color={theme.subText}
              style={navStyles.chevron}
            />
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

  // 🔧 removi "gap" para compatibilidade total
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logoText: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
    marginLeft: 2,
  },

  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconBtn: {
    padding: 4,
    marginRight: 10,
  },

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

  profileBtn: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginLeft: 5
  },

  userAvatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9'
  },

  avatarImage: {
    width: '100%',
    height: '100%'
  },

  avatarFallback: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },

  avatarText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16
  },

  chevron: {
    marginLeft: -6,
    marginBottom: -2,
    backgroundColor: '#F8FAFC',
    borderRadius: 10
  }
});

export default Navbar;