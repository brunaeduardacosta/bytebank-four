import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface NavbarProps {
  theme: any;
}

const Navbar: React.FC<NavbarProps> = ({ theme }) => {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  
  // Hook que calcula a barra de status / notch dinamicamente
  const insets = useSafeAreaInsets();

  const userInitial = user?.name
    ? user.name.charAt(0).toUpperCase()
    : 'A';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.card,
          borderBottomColor: theme.border,
          // Garante o preenchimento seguro apenas no topo do notch
          paddingTop: insets.top, 
        },
      ]}
    >
      <StatusBar 
        barStyle={theme.dark ? 'light-content' : 'dark-content'} 
        backgroundColor="transparent" 
        translucent 
      />

      <View style={styles.inner}>
        {/* ESQUERDA: Botão clicável que leva ao Dashboard */}
        <TouchableOpacity 
          style={styles.left}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <MaterialCommunityIcons
            name="shield-check"
            size={24}
            color={theme.accent}
            style={styles.logoIcon}
          />

          <View style={styles.logoWrapper}>
            <Text style={[styles.logoText, { color: theme.text }]}>
              BYTE
            </Text>
            <Text style={[styles.logoTextAccent, { color: theme.accent }]}>
              BANK
            </Text>
          </View>
        </TouchableOpacity>

        {/* DIREITA: Notificações e Perfil */}
        <View style={styles.right}>
          {/* NOTIFICAÇÃO */}
          <TouchableOpacity
            style={styles.iconButton}
            activeOpacity={0.7}
          >
            <Ionicons
              name="notifications-outline"
              size={22}
              color={theme.text}
            />
            <View style={[styles.notificationBadge, { borderColor: theme.card }]} />
          </TouchableOpacity>

          {/* PERFIL */}
          <TouchableOpacity
            style={styles.profile}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Profile')}
          >
            <View style={[styles.avatar, { borderColor: theme.border }]}>
              {user?.photoUrl ? (
                <Image
                  source={{ uri: user.photoUrl }}
                  style={styles.avatarImage}
                />
              ) : (
                <View
                  style={[
                    styles.avatarFallback,
                    { backgroundColor: theme.accent },
                  ]}
                >
                  <Text style={styles.avatarText}>
                    {userInitial}
                  </Text>
                </View>
              )}
            </View>

            <Ionicons
              name="chevron-down"
              size={14}
              color={theme.textSecondary || theme.subText}
              style={styles.chevron}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    width: '100%',
  },

  inner: {
    height: 64, 
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  left: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%', // Aumenta a área de clique verticalmente para melhor UX
  },

  logoIcon: {
    marginRight: 6,
  },

  logoWrapper: {
    flexDirection: 'row',
  },

  logoText: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },

  logoTextAccent: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
    marginLeft: 2,
  },

  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconButton: {
    marginRight: 16,
    padding: 4,
  },

  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
  },

  profile: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },

  avatarImage: {
    width: '100%',
    height: '100%',
  },

  avatarFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },

  chevron: {
    marginLeft: 4,
  },
});

export default Navbar;