# Bytebank Mobile

💸Status do Projeto: 
🚀 Em desenvolvimento / Versão 1.0O 

Bytebank Mobile é uma solução completa de gerenciamento financeiro pessoal. Desenvolvido em React Native com Expo, o aplicativo permite o controle rigoroso de receitas e despesas com persistência em nuvem via Firebase, oferecendo uma interface moderna e segura para o usuário final.

📱 Funcionalidades Principais:

Autenticação Segura:
- Cadastro de novos usuários.
- Login com persistência de sessão (AsyncStorage).

Experiência do Usuário (UX):
- Onboarding interativo para novos perfis.
- Dashboard dinâmico com saldo real, total de entradas e saídas.
 
Gestão de Lançamentos:
- Cadastro de Transações (Receitas e Despesas).
- Edição e Exclusão de lançamentos existentes.

Análise de Dados:
- Relatórios Gráficos (Barras e Pizza) para visualização de gastos por categoria.
- Filtros Avançados por período (Data Inicial/Final) e Categoria.

🛠️ Tecnologias Utilizadas

React Native / Expo	Framework Base

TypeScript:	Tipagem estática e segurança de código

Firebase: Auth	Autenticação de usuários

Firestore:	Banco de dados NoSQL em tempo real

Gifted Charts:	Visualização de dados e gráficos

React Navigation:	Navegação entre telas (Stack/Tabs

📂 Estrutura de Pastas

Plaintextbytebank-mobile/

├── src/

│   ├── components/       # UI Reutilizável (Botões, Inputs, Navbar)

│   ├── context/          # Provedores de estado (Auth, Theme, Transactions)

│   ├── navigation/       # Configuração de rotas e pilhas

│   ├── screens/          # Telas (Login, Dashboard, Resumo, Form)

│   ├── services/         # Configuração Firebase e chamadas API

│   └── types/            # Interfaces e definições TypeScript

├── assets/               # Mídias, ícones e splash screen

└── App.tsx               # Componente raiz


🚀 Como Rodar o Projeto Localmente

1. Preparação do Ambiente

# Clone o repositório
git clone https://github.com/SEU-USUARIO/bytebank-mobile.git

# Entre no diretório
cd bytebank-mobile

# Instale as dependências
npm install

2. Configuração do Firebase

Crie o arquivo src/services/firebaseConfig.ts e preencha com suas credenciais do console Firebase:TypeScriptconst firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_PROJETO.appspot.com",
  messagingSenderId: "MESSAGING_ID",
  appId: "APP_ID"
};


5. Execução

# Inicie o servidor do Expo
npx expo start
Utilize o app Expo Go no celular ou um emulador Android/iOS para visualizar.

🔐 Regras de Segurança (Firestore)

Para proteção dos dados dos usuários em ambiente de produção, utilize:JavaScriptservice cloud.firestore {
  match /databases/{database}/documents {
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}

⚠️ Configurações Importantes (Babel & Reanimated)Caso utilize animações ou gráficos, garanta que seu babel.config.js contenha o plugin necessário:JavaScriptmodule.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'], // Obrigatório para animações
  };
};
👥 AutoresBruna Eduarda - Graduada em ADSArthur De Lima - Graduado em ADSEste projeto foi desenvolvido para fins acadêmicos e educacionais. 🎓
