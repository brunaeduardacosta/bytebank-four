export type Categoria = {
  id: string;
  label: string;
  icon: string;
};

export type CategoriasType = {
  RECEITA: Categoria[];
  DESPESA: Categoria[];
};

export const CATEGORIAS: CategoriasType = {
  RECEITA: [
    {
      id: 'salario',
      label: 'Salário',
      icon: 'cash',
    },
    {
      id: 'freelance',
      label: 'Freelance',
      icon: 'laptop',
    },
    {
      id: 'investimento',
      label: 'Investimento',
      icon: 'trending-up',
    },
    {
      id: 'presente',
      label: 'Presente',
      icon: 'gift',
    },
    {
      id: 'venda',
      label: 'Venda',
      icon: 'tag-outline',
    },
    {
      id: 'outros_rec',
      label: 'Outros',
      icon: 'dots-horizontal',
    },
  ],

  DESPESA: [
    {
      id: 'alimentacao',
      label: 'Alimentação',
      icon: 'food',
    },
    {
      id: 'mercado',
      label: 'Mercado',
      icon: 'cart-outline',
    },
    {
      id: 'transporte',
      label: 'Transporte',
      icon: 'car',
    },
    {
      id: 'combustivel',
      label: 'Combustível',
      icon: 'gas-station',
    },
    {
      id: 'lazer',
      label: 'Lazer',
      icon: 'beach',
    },
    {
      id: 'saude',
      label: 'Saúde',
      icon: 'medical-bag',
    },
    {
      id: 'educacao',
      label: 'Educação',
      icon: 'school',
    },
    {
      id: 'moradia',
      label: 'Moradia',
      icon: 'home',
    },
    {
      id: 'contas',
      label: 'Contas',
      icon: 'file-document-outline',
    },
    {
      id: 'compras',
      label: 'Compras',
      icon: 'shopping-outline',
    },
    {
      id: 'assinaturas',
      label: 'Assinaturas',
      icon: 'youtube-subscription',
    },
    {
      id: 'pets',
      label: 'Pets',
      icon: 'dog',
    },
    {
      id: 'outros_desp',
      label: 'Outros',
      icon: 'dots-horizontal',
    },
  ],
};

export const TODAS_CATEGORIAS = [
  ...CATEGORIAS.RECEITA,
  ...CATEGORIAS.DESPESA,
];

export const getCategoryByLabel = (label: string) => {
  return TODAS_CATEGORIAS.find((item) => item.label === label);
};

export const getCategoryById = (id: string) => {
  return TODAS_CATEGORIAS.find((item) => item.id === id);
};