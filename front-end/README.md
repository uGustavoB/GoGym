# GoGym - Web Frontend

Bem-vindo ao repositório Frontend do **GoGym**, a interface elegante e interativa feita inteiramente com foco no usuário, guiando Personal Trainers e seus Alunos num fluxo visual requintado no mundo do Fitness!

Esta SPA (Single Page Application) foi construída apostando alto no visual dinâmico, nas micro-animações visando experiência do usuário (UX) com extrema polidez.

## 🚀 Tecnologias Integradas
- **Next.js (App Router)** - Framework React para o front-end
- **Tailwind CSS** - Utilitários rápidos para estilização fluída e flexível
- **Shadcn UI** - Bibliotecas de acesso e Design System unificados
- **Framer Motion** - Transições, deslizamentos e desfoques interativos
- **Lucide Icons** - Ícones limpos e minimalistas

## 🛠️ Como Iniciar Localmente

1. **Instale as dependências essenciais do pacote via NPM:**
   ```bash
   npm install
   ```

2. **Configuração Variáveis de Ambiente:**
   Crie um `.env.local` na raiz e tenha certeza de apontar quem é nossa **API Base URL** Laravel. O comportamento nativo deve comunicar com a porta `84`.
   ```dotenv
    NEXT_PUBLIC_API_BASE_URL=http://localhost:84/api
   ```
   *(A porta 84 deve casar perfeitamente para que os Middlewares Sanctum funcionem).*

3. **Start do Ambiente**
   Aqueça os motores chamando a run CLI:
   ```bash
   npm run dev
   ```
   A aplicação fará interface acessível pelo seu localhost: [http://localhost:3000](http://localhost:3000).

## 🗂️ Estrutura & Fluxos Principais
- **Módulo Unificado de Autenticação (`/auth`):** Combinada a área "Entrar" com "Nova Conta" através do componente inteligente local `<AuthScreen />`. Utiliza a classe do Framer e alternância de transições que dispensam renderizações bruscas.
- **Roteamento Dinâmico Inteligente dos Convites:** Formulários independentes, mas reativos que lêem as checagens URL baseando-se por chaves (`tipo=aluno&token_convite=X`). Esse ecossistema permite preencher para o Aluno a autoridade provida pelo seu Personal de forma amigável ao usuário.
- **Restauração e Verificação:** Interfaces adaptáveis com `Suspense` carregando visualments Feedbacks visuais e validação dos Tokens HMAC do back-end antes mesmo do formulário liberar as submissões finais em tela.

## 📦 Scripts Disponíveis
- `npm run dev`: Lança o site em modo desenvolvimento com Refreshing rápido.
- `npm run build`: Otimização pura em empacotações sólidas para servidor de Produção.
- `npm run typecheck`: Validador estrito executando a análise sintática de todo Repositório (`tsc`), excelente para rastreio de imports e compatibilidade.
- CLI de Componentes Shadcn (`npx shadcn@latest add [component]`): Utilizada localmente para plugar botões padronizados no `<components/ui/>`.

---
*Para manter a essência da fluidez do design local, encorajamos que eventuais novas contribuições no layout mantenham a sincronia das transições do React e atuem sobre o uso base das cores da Tailwind!*
