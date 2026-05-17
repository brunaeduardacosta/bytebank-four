export const formatCurrency = (
  value: number | undefined | null
): string => {
  const safeValue = value ?? 0;

  return safeValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

export const parseCurrencyInput = (value: string): string => {
  return value.replace(/\D/g, '');
};