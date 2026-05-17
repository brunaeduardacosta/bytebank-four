import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const uploadReceipt = async (
  imageUri: string,
  userId: string
): Promise<string> => {
  try {
    const response = await fetch(imageUri);

    const blob = await response.blob();

    const storage = getStorage();

    const fileRef = ref(
      storage,
      `receipts/${userId}/${Date.now()}.jpg`
    );

    await uploadBytes(fileRef, blob);

    return await getDownloadURL(fileRef);
  } catch (error) {
    console.error('Erro upload:', error);
    throw error;
  }
};