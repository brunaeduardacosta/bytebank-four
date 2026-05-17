export const parseValue = (value: string) => {
  if (!value) return 0;
  return parseFloat(value.replace(/\./g, '').replace(',', '.'));
};

export const formatMoneyInput = (text: string) => {
  const clean = text.replace(/\D/g, '');
  if (!clean) return '';

  const value = parseFloat(clean) / 100;

  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};