
# Bytebank Mobile
Aplicação mobile desenvolvida com foco em controle financeiro pessoal, permitindo o gerenciamento de receitas e despesas, visualização de saldo e resumo financeiro, além de autenticação de usuários.

O projeto foi construído seguindo princípios de Clean Architecture, com foco em escalabilidade, performance e boas práticas de desenvolvimento mobile.


## **Tecnologias Utilizadas**
React Native (Expo)
TypeScript
Firebase (Authentication + Firestore)
Zustand (State Management)
React Navigation (Stack + Drawer)
AsyncStorage
Expo Local Authentication (Biometria)
Expo Vector Icons
React Native Gesture Handler
React Native Reanimated

## Arquitetura

O projeto segue Clean Architecture, dividido em camadas:

**domain** → regras de negócio e use cases
**infrastructure** → Firebase, APIs e persistência
**presentation** → telas, componentes, hooks e state management
**core** → utilitários, constantes e configurações globais

## Pré-requisitos

Antes de rodar o projeto, você precisa ter instalado:

Node.js (>= 18)
Expo CLI
Git
Android Studio ou Expo Go (mobile)

##  Instalação

Clone o repositório:

**git clone** https://github.com/seu-usuario/bytebank-four.git

Entre na pasta do projeto:

cd bytebank-four

Instale as dependências:

npm install

ou

yarn install

## Configuração do Firebase

Crie um arquivo .env na raiz do projeto:

EXPO_PUBLIC_FIREBASE_API_KEY=xxxx
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=xxxx
EXPO_PUBLIC_FIREBASE_PROJECT_ID=xxxx
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=xxxx
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxxx
EXPO_PUBLIC_FIREBASE_APP_ID=xxxx

## Executando o Projeto

Inicie o projeto com:

npx expo start

Para limpar cache (recomendado em caso de erro):

npx expo start --clear

## Rodando no celular
Instale o app Expo Go
Escaneie o QR Code gerado no terminal

## Funcionalidades
Autenticação de usuário (Firebase Auth)
Cadastro e login
Controle de receitas e despesas
Cálculo automático de saldo
Resumo financeiro
Persistência de dados
Proteção por biometria
Navegação com Drawer + Stack
Onboarding inicial

## Melhorias Implementadas
Clean Architecture
Zustand para estado global
Cache e persistência com AsyncStorage
Lazy loading de telas
Otimização de renderização (memoization)
Limitação de queries no Firestore
Separação de responsabilidades (domain / infra / presentation)

## Estrutura do Projeto
src/
 ├── domain/
 ├── infrastructure/
 ├── presentation/
 ├── core/

## Autor

Desenvolvido como parte do Tech Challenge – FIAP
Bruna Eduarda; Arthur Tenorio

## Observação Importante

Esse projeto foi estruturado com foco em:

escalabilidade
boas práticas de mercado
arquitetura profissional
performance mobile
