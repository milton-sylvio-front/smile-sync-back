# Smile Sync — API

Backend REST para gestão de clínicas odontológicas. A API foi construída com
Node.js, TypeScript, Express, PostgreSQL e Supabase. O schema de dados é
documentado em [`prisma/schema.prisma`](./prisma/schema.prisma).

> **Estado do projeto:** o schema Prisma e a integração de consultas PostgreSQL
> estão definidos. As rotas REST abaixo estão conectadas na aplicação; alguns
> módulos de serviços, integrações e jobs ainda são estruturas iniciais. Confira
> a implementação de cada módulo antes de depender de uma funcionalidade em
> produção.

## Conteúdo

- [Tecnologias](#tecnologias)
- [Requisitos](#requisitos)
- [Configuração](#configuração)
- [Executar](#executar)
- [Banco de dados](#banco-de-dados)
- [API](#api)
- [Autenticação e acesso](#autenticação-e-acesso)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Testes e limitações conhecidas](#testes-e-limitações-conhecidas)

## Tecnologias

- Node.js e TypeScript
- Express 5
- PostgreSQL hospedado no Supabase
- Prisma Schema para modelagem e gerenciamento de migrações
- Zod para validação de dados
- JWT e bcrypt para autenticação e senhas
- Vitest e Supertest para testes

## Requisitos

- Node.js **20 ou superior** e npm
- Um projeto Supabase com acesso PostgreSQL
- Uma chave JWT privada com pelo menos 32 caracteres
- Uma chave base64 de 32 bytes para criptografia dos dados clínicos

Use uma versão recente do Node.js: as versões instaladas de TypeScript, Prisma e
Vitest podem não funcionar em versões antigas do Node.

## Configuração

1. Instale as dependências:

   ```bash
   npm ci
   ```

2. Crie um arquivo `.env` na raiz do projeto. Use os endereços e credenciais do
   seu próprio ambiente; não publique esse arquivo:

   ```dotenv
   PORT=3333

   # Conexão PostgreSQL usada pela API para executar consultas no Supabase.
   SUPABASE_DB_URL="postgresql://postgres:<senha>@<host>:5432/postgres?sslmode=require"

   # Conexões consumidas pela configuração do Prisma.
   DATABASE_URL="postgresql://postgres:<senha>@<host>:5432/postgres?sslmode=require"
   DIRECT_URL="postgresql://postgres:<senha>@<host>:5432/postgres?sslmode=require"

   # Gere um segredo privado, aleatório, com pelo menos 32 caracteres.
   JWT_SECRET="<segredo-aleatorio-com-no-minimo-32-caracteres>"

   # Chave base64 correspondente a 32 bytes aleatórios.
   DATA_ENCRYPTION_KEY="<chave-base64-de-32-bytes>"
   ```

   `SUPABASE_DB_URL` é exigida pela conexão usada em runtime. `DATABASE_URL` é
   usada pelo Prisma CLI conforme `prisma.config.ts` e `schema.prisma`;
   `DIRECT_URL` está declarado como URL direta no schema. Configure as três
   URLs para o banco apropriado ao ambiente. Em Supabase, use a conexão indicada
   pelo painel e siga as orientações de SSL e connection pooling para o seu
   runtime.

   Gere os valores secretos sem reutilizá-los entre ambientes:

   ```bash
   openssl rand -base64 32
   ```

   O valor pode ser usado como `DATA_ENCRYPTION_KEY`. Gere um valor separado
   para `JWT_SECRET`. **Não altere a chave de criptografia depois de salvar
   dados clínicos**, pois os dados já gravados dependem dela para serem
   descriptografados.

   A configuração também contém variáveis de URL e chaves Supabase usadas por
   clientes SDK. Elas não são necessárias para as consultas atuais da API, que
   usam `SUPABASE_DB_URL`. Nunca exponha chaves secretas ou credenciais de banco
   em aplicações frontend.

## Executar

Modo de desenvolvimento com reinicialização automática:

```bash
npm run dev
```

Compilar e iniciar:

```bash
npm run build
npm start
```

Por padrão, a API escuta em `http://localhost:3333`. O valor pode ser alterado
com `PORT`. A rota de verificação de disponibilidade é `GET /health`.

## Banco de dados

O schema Prisma define os modelos, enums, relações, índices e nomes físicos das
tabelas. Os nomes de tabela são mapeados em `snake_case` via `@@map`; os campos
mantêm os nomes declarados no Prisma. Os principais grupos de dados são:

| Grupo | Modelos / tabelas |
|---|---|
| Clínica e equipe | `Clinic` (`clinics`), `BusinessHour` (`business_hours`), `User` (`users`), `RefreshToken` (`refresh_tokens`), `Subscription` (`subscriptions`) |
| Pacientes | `Patient` (`patients`), `PatientConsent` (`patient_consents`) |
| Agenda e procedimentos | `Procedure` (`procedures`), `Appointment` (`appointments`), `AppointmentProcedure` (`appointment_procedures`) |
| Prontuário | `ClinicalRecord` (`clinical_records`), `ToothCondition` (`tooth_conditions`), `ClinicalEntry` (`clinical_entries`) |
| Planos e documentos | `TreatmentPlan` (`treatment_plans`), `TreatmentPlanItem` (`treatment_plan_items`), `Document` (`documents`) |
| Financeiro | `FinanceCategory` (`finance_categories`), `Transaction` (`transactions`) |
| Comunicação e reativação | `WhatsappTemplate` (`whatsapp_templates`), `WhatsappMessage` (`whatsapp_messages`), `ReactivationCampaign` (`reactivation_campaigns`) |
| Auditoria | `AuditLog` (`audit_logs`) |

O schema também define enums para papéis de usuário, status de pacientes e
consultas, consentimentos, prontuário, planos, documentos, transações,
mensagens, campanhas e assinaturas. Consulte o arquivo Prisma para os valores
permitidos e as regras de cada relação.

### Prisma e migrações

O Prisma CLI lê `prisma.config.ts`, que aponta para
`prisma/schema.prisma`. Para gerar o cliente:

```bash
npx prisma generate
```

O cliente gerado fica em `src/generated/prisma`. A API atualmente executa as
consultas via `@supabase/server` e não importa esse cliente Prisma no fluxo de
runtime.

Se ainda não existe uma migração inicial no repositório, crie-a em um banco de
desenvolvimento e revise o SQL antes de versioná-la:

```bash
npx prisma migrate dev --name init
```

Depois que as migrações estiverem versionadas, aplique-as em produção com:

```bash
npx prisma migrate deploy
```

Não execute migrações de desenvolvimento contra produção. Faça backup e revise
as migrações antes de aplicar mudanças em dados reais.

## API

As rotas da aplicação ficam sob o prefixo `/api`. Exceto pelos endpoints de
autenticação, exigem `Authorization: Bearer <token>`.

### Autenticação

| Método | Caminho | Descrição |
|---|---|---|
| `POST` | `/api/auth/register` | Cria uma clínica e seu primeiro usuário proprietário |
| `POST` | `/api/auth/login` | Autentica com e-mail e senha |
| `GET` | `/api/auth/me` | Retorna o identificador, a clínica e o papel do usuário autenticado |

O token de acesso é JWT assinado com `JWT_SECRET` e expira em 15 minutos. O
login e o cadastro têm limitação de requisições. O schema contém uma tabela
`refresh_tokens`, mas um fluxo de renovação de token não está exposto pelas
rotas atuais.

### Recursos

Os recursos com CRUD genérico aceitam listagem e consulta por ID (`GET`),
criação (`POST`), atualização parcial (`PATCH`) e exclusão (`DELETE`), salvo
quando indicado. Os campos aceitos são definidos pelos schemas Zod de cada
módulo.

| Caminho | Recurso |
|---|---|
| `/api/clinics` | Dados da clínica: consulta e atualização |
| `/api/clinics/business-hours` | Horários de funcionamento |
| `/api/appointments` | Consultas |
| `/api/audit` | Logs de auditoria; somente leitura |
| `/api/billing` | Assinatura da clínica; somente leitura |
| `/api/dashboard/summary` | Resumo de pacientes, consultas e financeiro |
| `/api/documents` | Metadados de documentos |
| `/api/finance/categories` | Categorias financeiras |
| `/api/finance/transactions` | Transações financeiras |
| `/api/patients` | Pacientes |
| `/api/procedures` | Procedimentos |
| `/api/reactivation/campaigns` | Campanhas de reativação |
| `/api/records` | Prontuários clínicos |
| `/api/records/entries` | Entradas de prontuário |
| `/api/treatment-plans` | Planos de tratamento |
| `/api/users` | Usuários da clínica |
| `/api/whatsapp/templates` | Modelos de mensagens |
| `/api/whatsapp/messages` | Mensagens |

Os recursos de listas usam paginação por `page` e `pageSize`, com valores
padrão `1` e `25` e limite máximo de 100 itens por página. A resposta contém
`data`, `page`, `pageSize` e `total`. Criações retornam `201`; exclusões bem
sucedidas retornam `204`.

### Usuários

`/api/users` permite listar e consultar usuários da clínica (`GET`), criar
(`POST`), atualizar parcialmente (`PATCH /:id`) e excluir (`DELETE /:id`).
Apenas `OWNER` e `ADMIN` podem acessar o recurso; a exclusão é lógica e usuários
excluídos deixam de aparecer nas consultas. O campo `password` é obrigatório na
criação (12 a 128 caracteres), opcional na atualização, armazenado como hash e
nunca retornado pela API. Os papéis que podem ser atribuídos são `ADMIN`,
`DENTIST` e `RECEPTION`; `OWNER` é reservado ao cadastro da clínica.

Exemplo de criação:

```http
POST /api/users
Authorization: ******
Content-Type: application/json

{
  "brandName": "Smile Sync",
  "title": "Bem-vindo",
  "subtitle": "Acesse sua conta",
  "fullName": "João da Silva",
  "birthDate": "1990-05-20",
  "document": "12345678900",
  "phone": "+5511999999999",
  "email": "joao@example.com",
  "password": "uma-senha-segura-123",
  "termsLabel": "Li e aceito",
  "terms": { "version": "1", "content": "Termos de uso" },
  "termsConjunction": "e",
  "privacy": { "version": "1", "content": "Política de privacidade" },
  "submitLabel": "Criar conta",
  "loginPrompt": "Já possui uma conta?",
  "login": "Entrar",
  "copyright": "© Smile Sync",
  "securityNote": "Seus dados são protegidos",
  "role": "DENTIST"
}
```

Na atualização, envie somente os campos a alterar; para trocar a senha,
inclua `password` no corpo do `PATCH`.

A tabela `users` também contém `brandName`, `title`, `subtitle`, `fullName`,
`birthDate`, `document`, `phone`, `termsLabel`, `terms`, `termsConjunction`,
`privacy`, `submitLabel`, `loginPrompt`, `login`, `copyright` e `securityNote`.
`birthDate` é armazenado como `DATE`; `terms` e `privacy` são objetos JSONB.
O documento pessoal é criptografado no banco. O campo de entrada `password`
continua sendo armazenado somente como hash em `passwordHash`. Os novos campos
são opcionais para manter compatibilidade com usuários existentes.

Exemplo de listagem:

```http
GET /api/patients?page=1&pageSize=25
Authorization: Bearer <token>
```

Exemplo de criação:

```http
POST /api/patients
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Maria da Silva",
  "phone": "+5511999999999",
  "tags": ["retorno"]
}
```

O endpoint de resumo aceita `from` e `to` como datas ISO datetime. Em erros de
validação, a API responde com HTTP `400` e uma lista `details`; erros de
autenticação e autorização usam `401` e `403`.

## Autenticação e acesso

- Os tokens JWT contêm o usuário, a clínica e seu papel (`OWNER`, `ADMIN`,
  `DENTIST` ou `RECEPTION`).
- As rotas autenticadas obtêm a clínica do token; o CRUD aplica filtros de
  `clinicId` às consultas, atualizações e exclusões.
- Os papéis permitidos variam por grupo de rotas e por recurso. A configuração
  está em `src/routes.ts` e nos modelos em `src/modules/`.
- Senhas de usuários são armazenadas como hashes bcrypt, nunca como texto puro.
- Dados de anamnese e conteúdo de entradas clínicas são criptografados com
  AES-256-GCM antes de serem gravados. Proteja e faça backup seguro de
  `DATA_ENCRYPTION_KEY`.
- Exclusões de pacientes e usuários são lógicas; uma data é gravada em
  `deletedAt`. Entradas clínicas assinadas não podem ser alteradas nem excluídas
  pelo CRUD genérico.
- A conexão PostgreSQL deve permanecer no servidor. A autenticação e os filtros
  da API não substituem a configuração adequada de permissões e políticas de
  acesso no projeto Supabase.

## Estrutura do projeto

```text
prisma/
  schema.prisma          # Modelos, enums e relações
src/
  app.ts                 # Aplicação Express, health check e erros
  server.ts              # Inicialização do servidor e conexão com o banco
  routes.ts              # Montagem das rotas e autorização por papel
  database/              # Consultas PostgreSQL via Supabase
  modules/               # Rotas, modelos e lógica por domínio
  shared/                # Middlewares, erros e utilitários comuns
  integrations/          # Pontos de integração externos
  jobs/                  # Estruturas para tarefas agendadas
  scripts/               # Scripts auxiliares
```

Os clientes de IA, armazenamento e WhatsApp, bem como os jobs de lembretes,
reativação e expiração de trial, estão organizados em seus diretórios próprios.
Sua presença na estrutura não significa que estejam todos inicializados ou
integrados ao ciclo de execução do servidor.

## Testes e limitações conhecidas

Execute os testes disponíveis com:

```bash
npm test -- --run
```

O projeto também oferece `npm run build` para compilar e validar tipos. Nem
todos os domínios possuem testes automatizados. Algumas rotas e serviços ainda
precisam de implementação ou revisão funcional; confirme a cobertura e o
comportamento real antes de usar em produção.
