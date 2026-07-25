# Copilot Instructions

Este projeto é uma API REST em **Node.js** usando **Fastify** e **MongoDB (Mongoose)**.
Sempre siga rigorosamente os padrões abaixo ao gerar ou sugerir código. Não crie abstrações novas, não mude a arquitetura, não sugira bibliotecas fora do stack já utilizado.

## Stack

- Fastify (não Express)
- Mongoose (MongoDB)
- argon2 para hash de senha
- jsonwebtoken para autenticação (access token + refresh token)
- ES Modules (`import`/`export`, `"type": "module"` no package.json)
- Sem TypeScript — apenas JavaScript puro

## Arquitetura (sempre seguir essa estrutura de pastas)

src/
models/ -> Schemas do Mongoose (ex: user.model.js)
dtos/ -> Funções puras que filtram/formatam o body recebido (ex: user.dto.js)
services/ -> Regra de negócio e acesso ao banco (ex: user.service.js)
controllers/ -> Recebem request/reply do Fastify e chamam o service (ex: user.controller.js)
routes/ -> Definem os endpoints e aplicam middlewares (ex: user.routes.js)
errors/ -> AppError.js (erro customizado com statusCode)
database/ -> Conexão com o MongoDB (db.js)

Cada entidade nova (ex: "product") deve seguir exatamente esse mesmo padrão de 5 arquivos: `model`, `dto`, `service`, `controller`, `routes`.

## Padrão de Model (Mongoose)

- Sempre usar `mongoose.Schema` com `{ timestamps: true }`
- Campos geralmente `required: false`, a menos que peça explicitamente obrigatoriedade
- Sub-schemas (como `addressSchema`) usam `{ _id: false }`
- Sempre checar se o model já existe antes de criar: `mongoose.models.NOME || mongoose.model(...)`
- Se o model tiver campos sensíveis (senha, tokens), sobrescrever `toJSON()` para removê-los da resposta
- Exemplo: models/user.model.js

## Padrão de DTO

- Funções puras exportadas (`createXDTO`, `updateXDTO`, `loginXDTO`, etc.)
- `create...DTO`: retorna um objeto explícito com os campos permitidos, usando `??` para valores default
- `update...DTO`: usa uma lista `allowed` e filtra o `body` com `Object.entries(body).filter(...)`, permitindo atualização parcial
- DTOs nunca acessam o banco — são apenas transformação/validação de shape
- Exemplo: dtos/user.dto.js

## Padrão de Service

- Objeto exportado (ex: `export const UserService = {...}`), não classe
- Cada método é `async`
- Sempre usar o DTO correspondente antes de salvar/atualizar
- Validar relacionamentos (ex: se `churchId` existe) antes de criar/atualizar
- Lançar `AppError('mensagem', statusCode)` para erros de negócio (nunca `throw new Error` puro)
- Para login: verificar usuário, validar senha com `argon2.verify`, gerar `accessToken` (1h) e `refreshToken` (7d) com `jwt.sign`, salvar o refreshToken no usuário
- Para refresh: verificar o token, comparar com o salvo no banco, gerar novo accessToken
- Nunca retornar a senha (usar `.toJSON()` do model ou remover manualmente)
- Exemplo: services/user.service.js

## Padrão de Controller

- Recebe `(request, reply)` do Fastify
- Chama o service correspondente
- Não contém regra de negócio, apenas orquestra a chamada e a resposta
- Deixa erros subirem para o `setErrorHandler` global (não usar try/catch redundante a menos que precise tratar algo específico)
- Exemplo: controllers/user.controller.js

## Padrão de Routes

- Uma função `async function xRoutes(fastify) {...}` exportada
- Separar rotas públicas de rotas protegidas
- Rotas protegidas ficam dentro de `fastify.register(async function (fastify) {...})` com `fastify.addHook('preHandler', authenticate)`
- Nomes de rotas em inglês, no plural (ex: `/users`, `/users/:id`)
- Exemplo: routes/user.routes.js

## Autenticação

- Middleware `authenticate` em `routes/middleware/authMiddleware.js`
- Lê `Authorization: Bearer <token>`, verifica com `jwt.verify`, injeta `req.user`
- Lança `AppError('Token not provided', 401)` ou `AppError('Invalid token', 401)`

## Tratamento de erros

- Sempre usar a classe `AppError` (`errors/AppError.js`) para erros esperados: `new AppError('mensagem', statusCode)`
- Nunca tratar erro manualmente nos controllers/routes — o `fastify.setErrorHandler` global no `index.js` já formata a resposta:
```json
{ "success": false, "message": "..." }
```

## index.js

- Registro de plugins (`@fastify/cors`), rotas com prefixo `/api`, error handler global e conexão com o banco antes do `fastify.listen`

## Convenções gerais

- Idioma dos comentários, mensagens de log, nomes de variáveis, funções e rotas em inglês
- Não adicionar validação com libraries externas (zod, joi, etc.) a menos que eu peça
- Não reescrever ou "melhorar" código existente sem eu pedir — apenas seguir o padrão ao criar algo novo
- Ao criar uma nova entidade, gerar sempre os 5 arquivos (model, dto, service, controller, routes) seguindo fielmente os exemplos acima