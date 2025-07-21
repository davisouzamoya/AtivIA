# AtivIA

**AtivIA** é uma plataforma que utiliza inteligência artificial para ajudar professores a criar atividades pedagógicas personalizadas em minutos, economizando tempo e promovendo o aprendizado adaptado para cada turma.

## ✨ Funcionalidades

- **Geração automática de atividades**: múltipla escolha, verdadeiro ou falso, completar lacunas e dissertativas.
- **Personalização**: escolha tema, disciplina, objetivo, série e quantidade de questões.
- **Edição e armazenamento**: salve, edite e baixe suas atividades.
- **Exportação em PDF**: gere PDFs prontos para impressão.
- **Autenticação**: login seguro via Supabase.
- **Alinhamento curricular**: atividades baseadas na BNCC e currículos estaduais.

## 🚀 Começando

### Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com/)
- Chave de API do Google Gemini (para geração de conteúdo IA)

### Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/seu-repo.git
   cd seu-repo
   ```

2. Instale as dependências:
   ```bash
   npm install
   # ou
   pnpm install
   ```

3. Configure as variáveis de ambiente em um arquivo `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   NEXT_PUBLIC_GOOGLE_API_KEY=...
   ```

4. Inicie o projeto:
   ```bash
   npm run dev
   # ou
   pnpm dev
   ```

5. Acesse em [http://localhost:3000](http://localhost:3000)

## 🛠️ Scripts

- `dev`: inicia o servidor de desenvolvimento
- `build`: build de produção
- `start`: inicia o servidor em produção
- `lint`: executa o linter

## 📦 Principais Tecnologias

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [jsPDF](https://github.com/parallax/jsPDF) (geração de PDF)
- [Google Gemini API](https://ai.google.dev/)

## 📚 Estrutura das Atividades

- **Múltipla escolha**: questões com alternativas (a)-(d), gabarito ao final.
- **Verdadeiro ou falso**: afirmações para marcar, gabarito após cada questão.
- **Completar lacunas**: frases com espaços para preencher, gabarito ao final.
- **Dissertativa**: espaço para resposta escrita, orientações e linhas para o aluno.

## 🗄️ Banco de Dados

O projeto utiliza o Supabase para autenticação e armazenamento das atividades. Veja o arquivo `lib/activities.ts` para detalhes das operações CRUD.

## 📤 Exportação em PDF

Você pode exportar qualquer atividade para PDF, pronta para impressão, usando o botão disponível na tela de edição.

## 🔒 Autenticação

O login é obrigatório para criar, editar e visualizar atividades. O Supabase gerencia sessões e usuários.

## 🧑‍💻 Contribuindo

Pull requests são bem-vindos! Para grandes mudanças, abra uma issue primeiro para discutir o que você gostaria de modificar.

## 📄 Licença

[MIT](LICENSE)