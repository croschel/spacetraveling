import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

export const formatDate = (isoDate: string) => {
  return format(new Date(isoDate), "dd' 'MMM' 'yyyy", {
    locale: ptBR,
  });
};
