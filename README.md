# GoGym 🏋️‍♂️

> ⚠️ **Aviso:** Este projeto é uma prova de conceito (PoC) em desenvolvimento e encontra-se atualmente na sua **Fase 1 (Estruturação e Autenticação)**. Muitas funcionalidades ainda serão expandidas, refatoradas e incrementadas nas próximas etapas.

O GoGym está nascendo como uma plataforma concebida para facilitar a gestão e a proximidade entre **Personal Trainers** e seus **Alunos**. O objetivo final do sistema é permitir que um Personal gere convites unificados para seus clientes e os adicione a um fluxo centralizado onde planos de treino podem ser gerenciados com excelência.

Atualmente, o projeto foca na base estrutural e em um sistema moderno de admissão de usuários.

---

## 🛠️ Tecnologias e Arquitetura

O ecossistema divide-se em uma arquitetura robusta, focada em estabilidade no banco de dados e fluidez na interface de usuário desde o início.

### Front-end
- **Next.js** e **React** para construção dinâmica.
- **Tailwind CSS** para estilização ágil.
- **Shadcn UI** para componentes elegantes e customizáveis.
- Autenticação e restrição de rotas guiadas por **Context API**.

### Back-end
- **Laravel 11.x** (PHP 8.4) provendo serviços expostos via REST API.
- **Laravel Sanctum** emitindo Tokens.
- **MySQL 8.0** para persistência relacional principal de usuários.
- **Redis** para gerenciamento de _Queues_ provisório (como disparo de e-mails em _background_).

---

## 🚀 Como Executar Localmente (Ambiente de Desenvolvimento)

**Para a API (Back-end) utilizaremos o Docker**, então seu ambiente não precisa lidar com instalações de PHP ou bancos de dados isolados.
**Para o Front-end utilizaremos a instalação local padrão**, garantindo o máximo de velocidade no _Hot Reload_ no momento de codificar telas não finalizadas.

> **Pré-requisitos:**
> - [Docker](https://www.docker.com/) e Docker Compose.
> - [Node.js](https://nodejs.org/en/) (Versão 18 LTS ou superior).

### 1️⃣  Subindo a API Back-end (Docker)

No terminal e na raiz do seu projeto `GoGym`:

1. Entre no diretório do back-end:
   ```bash
   cd back-end
   ```
2. Copie o arquivo de exemplo de variáveis de ambiente:
   ```bash
   cp .env.example .env
   ```
3. Edite o `.env` para configurar as credenciais do Redis e do banco de dados, se necessário (as configurações padrão já estão otimizadas para o ambiente Docker):
   ```env
   DB_CONNECTION=mysql
   DB_HOST=db
   DB_PORT=3306
   DB_DATABASE=gogym
   DB_USERNAME=root
   DB_PASSWORD=rootpassword

   REDIS_HOST=redis
   REDIS_PORT=6379
   ```
4. Execute e monte as dependências:
   ```bash
   docker-compose up -d --build
   ```
5. Para acessar o terminal do contêiner PHP e rodar as migrations manualmente (caso queira verificar o processo):
   ```bash
   docker exec -it gogym_app bash
   php artisan migrate
   ```

Isso fará com que o Docker levante:
- `gogym_app`: o contêiner PHP da nossa base e API de autenticação (`localhost:8000`). Instala o Composer e popula as migrations nativamente no *build*.
- `gogym_queue`: o worker assíncrono para despachar os Jobs do Redis.
- `gogym_db` e `gogym_redis`: para armazenamento de dados temporários e estáveis.

(A Swagger UI já pode ser consultada sob a porta `/api/documentation`).

---

### 2️⃣ Subindo o Client Front-end (NPM)

1. Atravesse o diretório para a pasta base Front-end:
   ```bash
   cd front-end
   ```
2. Instale do zero as dependências de Node:
   ```bash
   npm install
   ```
3. Espelhe variáveis de ambiente necessárias (exemplo de `.env.local` configurado):
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8008/api
   ```
4. Inície o ecossistema React:
   ```bash
   npm run dev
   ```

Tudo pronto. O rascunho principal do projeto estará vivo em 👉 **http://localhost:3000**

---

## 🚧 Progresso Atual (Fase 1)

O que já foi finalizado nesta primeira etapa de validação:

- ✅ **API & Client:** separados, e arquitetura base do App Router conectada a um AuthContext.
- ✅ **Gestão e Disparo de Emails:** filas de `Redis` operacionais manipulando envios de SMTP para a validação de contas, envio de convites e recuperação de senhas.
- ✅ **Documentação Mínima:** inicializada anotações do Swagger PHP (`darkaonline/l5-swagger`).
- ✅ **Convites de Ingresso:** um Personal Trainer pode criar instâncias de convite em tabela e o aluno usa o _deep-link_ de e-mail para pré-popular (e bloquear dinamicamente) o seu formulário de registro unificado.

_Mais módulos de avaliações físicas e treinos estarão disponíveis em commits posteriores._
