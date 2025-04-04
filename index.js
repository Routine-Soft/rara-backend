// Importing and initializing dotenv
import dotenv from "dotenv"
dotenv.config();

// Importando MongoDB + Mongoose
const connectMongoDBWithMongoose = require('./src/database/connectMongoDBWithMongoose');
connectMongoDBWithMongoose();

// Importando Express e colocando dentro da constante "app"
const express = require('express');
const morgan = require('morgan'); // ajuda nas requisições HTTP mostrando tipo e tempo de resposta
const app = express();
app.use(express.json()); // sinalizando que receberá JSON
app.use(express.urlencoded({ extended: true })); // facilita a parte de envio de arquivos
app.use(morgan('dev'));


const cors = require('cors'); // importando cors
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

// Integrando o Socket.IO
const http = require('http'); // Necessário para o servidor HTTP
const server = http.createServer(app); // Criando o servidor HTTP com Express

// * ========== ROUTERS ======== *
const routerUser = require('./src/routes/routeUser')
app.use('/', routerUser)

const routerIgreja = require('./src/routes/routerIgreja')
app.use('/', routerIgreja)

const routerResetPassword = require('./src/routes/ResetPasswordRequest')
app.use('/', routerResetPassword)

const routerChristianGroup = require('./src/routes/routerChristianGroup')
app.use('/', routerChristianGroup)

// * ========== ROUTERS ======== *

// Definindo a porta
const port = 8080;

// Função que será executada quando o servidor ficar online
// app.listen(port, '0.0.0.0', () => console.log(`Rodando com Express na porta ${port}`));
server.listen(port, '0.0.0.0', () => {
    console.log(`Rodando com Express na porta ${port}`);
}).on('error', (err) => {
    console.error('Erro ao iniciar o servidor:', err);
});
