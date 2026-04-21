# GoGym - API Backend

Bem-vindo ao repositório Backend do **GoGym**, uma plataforma completa de gerenciamento para Academias, Personal Trainers e Alunos.

Esta API foi construída utilizando as melhores práticas do ecossistema PHP com [Laravel 11](https://laravel.com), oferecendo autenticação robusta via Sanctum, mensageria de e-mails, proteções de proxy e roteamento seguro de forma restrita e enxuta.

## 🚀 Tecnologias Integradas
- **PHP 8.2+** / **Laravel 11+**
- **Docker** para padronização minuciosa de ambientes em isolamento
- **Laravel Sanctum** para emissão e controle de SPA Bearer Tokens
- **Swagger / OpenAPI 3** para documentação de rotas API transparente
- Filas Assíncronas para Automação (*Ex: Disparo de E-mails*)
- PHPUnit configurado e mapeado para Testes Funcionais (`Feature Tests`)

## 🛠️ Como Instalar e Rodar

1. **Clone o repositório e instale as dependências**
   ```bash
   composer install
   ```

2. **Setup do Arquivo `.env`**
   Crie sua cópia do arquivo de ambiente base:
   ```bash
   cp .env.example .env
   ```
   Certifique-se de configurar e preencher perfeitamente os contatos do Banco de Dados, E-Mail Mailer (SMTP), além da Variável mais crítica para ponte com a Interface Next.js:
   ```dotenv
    APP_FRONTEND_URL=http://localhost:3000
   ```
   
3. **Gerar chaves mestras da Aplicação e a População de Dados (Seeders)**
   ```bash
   php artisan key:generate
   php artisan migrate --seed
   ```

## 📖 Documentação Endpoints (Swagger API)

Tornou-se muito fácil entender os modelos de contratos JSON no Frontend por conta dos mapeamentos no Swagger. O projeto utiliza anotações nativas nas `Controllers` extraídas na raiz do arquivo da Collection (`gogym.json` ou exportações no Swagger UI). 
Lidamos ativamente com atributos PHP (`#[OA\Get]`, `#[OA\Post]`) de forma profissional.

## 🔐 Padrões de Segurança - Verificação via E-mail
Para solucionar problemas corriqueiros de roteamento entre contêineres e proxy da máquina Host, a Verificação de E-mail (**Verification Email**) foi projetada para *ignorar* restrições estritas do Helper nativo de URL da Laravel (`temporarySignedRoute()`).
Em vez disso, utilizamos arquitetura de Token HMAC customizado, o que nos permitiu injetar a URL do frontend com Queries independentes, deixando a checagem no `VerificacaoEmailController.php` inteiramente resistente aos *binds* erráticos de IP e Portas do Docker.

---
*Back-end escrito e mantido focado sempre em alto desempenho para a saúde e treinos dos nossos usuários!*
