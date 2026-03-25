import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  StatusBar,
  Platform
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
// Importação essencial para lidar com o "notch" e a barra de status
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface NavbarProps {
  theme: any;
}

const Navbar: React.FC<NavbarProps> = ({ theme }) => {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  
  // Hook que calcula os espaços seguros da tela (em cima, embaixo, etc.)
  const insets = useSafeAreaInsets();

  const userInitial = user?.displayName
    ? user.displayName.charAt(0).toUpperCase()
    : 'A';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.card,
          borderBottomColor: theme.border,
          // Aplica o preenchimento no topo igual ao tamanho da StatusBar/Notch
          paddingTop: insets.top, 
        },
      ]}
    >
      {/* Dica: Isso garante que os ícones do sistema (hora/bateria) 
        se adaptem ao seu tema (dark ou light) 
      */}
      <StatusBar 
        barStyle={theme.dark ? 'light-content' : 'dark-content'} 
        backgroundColor="transparent" 
        translucent 
      />

      <View style={styles.inner}>
        {/* ESQUERDA: Logo e Nome */}
        <View style={styles.left}>
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
        </View>

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

            <View style={styles.notificationBadge} />
          </TouchableOpacity>

          {/* PERFIL */}
          <TouchableOpacity
            style={styles.profile}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Profile')}
          >
            <View style={[styles.avatar, { borderColor: theme.border }]}>
              {user?.photoURL ? (
                <Image
                  source={{ uri: user.photoURL }}
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
              color={theme.subText}
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
    // O container estica até o topo físico do celular
    width: '100%',
  },

  inner: {
    // Altura fixa para o conteúdo da navbar (sem contar a safe area)
    height: 64, 
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  left: {
    flexDirection: 'row',
    alignItems: 'center',
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
    borderColor: 'white', // Opcional: dá um destaque maior à bolinha
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