import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatDate = (date: Date): string => {
  return format(date, 'dd/MM/yyyy');
};

export const formatFullDate = (date: Date): string => {
  return format(date, "EEEE, dd 'de' MMMM", {
    locale: ptBR,
  });
};