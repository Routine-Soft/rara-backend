// Importing and initializing dotenv
import dotenv from "dotenv"
dotenv.config();

// Importando MongoDB + Mongoose
import connectMongoDBWithMongoose from './src/database/connectMongoDBWithMongoose.js'
connectMongoDBWithMongoose();

// Importando Express e colocando dentro da constante "app"
import express from 'express'
import morgan from 'morgan'
const app = express();
app.use(express.json()); // sinalizando que receberá JSON
app.use(express.urlencoded({ extended: true })); // facilita a parte de envio de arquivos
app.use(morgan('dev'));

import cors from 'cors'
const allowedOrigins = [
    '',
    '',
    'http://localhost:3000'
];
// Incluir site vercel que iriei criar

const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// * ========== ROUTERS ======== *
import routerUser from './src/routes/routeUser.js'
app.use('/', routerUser)

import routerIgreja from './src/routes/routerIgreja.js'
app.use('/', routerIgreja)

import routerResetPassword from './src/routes/ResetPasswordRequest.js'
app.use('/', routerResetPassword)

import routerChristianGroup from './src/routes/routerChristianGroup.js'
app.use('/', routerChristianGroup)

import routerMidiaLocal from './src/routes/routerMidiaLocal.js'
app.use('/', routerMidiaLocal)
// * ========== ROUTERS ======== *

// Definindo a porta
const port = 8080;

// Função que será executada quando o servidor ficar online
app.listen(port, '0.0.0.0', () => console.log(`Rodando com Express na porta ${port}`));
