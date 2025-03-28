// Importando dotenv
const dotenv = require('dotenv');
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
const socketIo = require('socket.io'); // Biblioteca para comunicação WebSocket
const io = socketIo(server, {
    cors: {
        origin: '*', // Permitir todas as origens
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    },
    transports: ['websocket', 'polling'], // Certifique-se de que o transporte do WebSocket está habilitado
});


io.on('connection', (socket) => {
    console.log('Novo cliente conectado');

    // Envia "ping" para os clientes conectados a cada 30 segundos
    const pingInterval = setInterval(() => {
        io.emit('ping');
        console.log('Ping enviado para os clientes');
    }, 30000); // Intervalo de 30 segundos

    // Exemplo de evento customizado
    socket.on('custom_event', (data) => {
        console.log('Evento recebido:', data);
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
        clearInterval(pingInterval); // Limpa o intervalo quando o cliente desconecta
    });
});


// Tornando o Socket.IO disponível nas rotas
app.set('io', io);

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
const port = 3000;

// Função que será executada quando o servidor ficar online
// app.listen(port, '0.0.0.0', () => console.log(`Rodando com Express na porta ${port}`));
server.listen(port, '0.0.0.0', () => {
    console.log(`Rodando com Express na porta ${port}`);
}).on('error', (err) => {
    console.error('Erro ao iniciar o servidor:', err);
});
