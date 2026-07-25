import Fastify from "fastify";
import fastifyCors from '@fastify/cors'
import dotenv from "dotenv"
import db from './src/database/db.js'
import { userRoutes } from "./src/routes/user.routes.js";
import { churchRoutes } from "./src/routes/church.routes.js";
import { midiaLocalRoutes } from "./src/routes/midialocal.routes.js";

dotenv.config();
const fastify = Fastify({ logger: true })

await fastify.register(fastifyCors, {            // 👈
  origin: true,                           // libera qualquer origem (em prod troca pelo domínio)
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
})

/* =====================================
   Error Handler Global
===================================== */

fastify.setErrorHandler((error, request, reply) => {

  fastify.log.error(error)

  return reply.status(error.statusCode || 500).send({
    success: false,
    message: error.message || 'Erro interno do servidor'
  })
})

// * ========== ROUTERS ======== *
await fastify.register(userRoutes, {prefix: '/api'});
await fastify.register(churchRoutes, {prefix: '/api'});
await fastify.register(midiaLocalRoutes, {prefix: '/api'});

// Conexão com MongoDB e start do servidor
const start = async () => {
  try {
    await db()

    await fastify.listen({ port: process.env.PORT || 8081, host: '0.0.0.0' })
    console.log(`🚀 Servidor rodando na porta ${process.env.PORT || 8081}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()