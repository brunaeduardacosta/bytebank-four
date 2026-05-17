export const fakeUpload = async (localUri: string) => {
  // Simula tempo de upload
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Gera URL simulada
  return `https://fake-storage.firebase.com/receipts/${Date.now()}.jpg`;
};