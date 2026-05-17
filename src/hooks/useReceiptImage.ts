import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export function useReceiptImage(initialImage?: string | null) {
  const [receiptImage, setReceiptImage] = useState<string | null>(
    initialImage || null
  );

  const handlePickImage = useCallback(() => {
    Alert.alert('Comprovante', 'Escolha uma opção', [
      {
        text: 'Câmera',
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();

          if (status !== 'granted') {
            return Alert.alert('Erro', 'Acesso à câmera negado.');
          }

          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.6,
          });

          if (!result.canceled) {
            setReceiptImage(result.assets[0].uri);
          }
        },
      },
      {
        text: 'Galeria',
        onPress: async () => {
          const { status } =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

          if (status !== 'granted') {
            return Alert.alert('Erro', 'Acesso à galeria negado.');
          }

          const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            quality: 0.6,
          });

          if (!result.canceled) {
            setReceiptImage(result.assets[0].uri);
          }
        },
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }, []);

  return {
    receiptImage,
    setReceiptImage,
    handlePickImage,
  };
}