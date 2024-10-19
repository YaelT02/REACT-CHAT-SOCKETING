import express from 'express'
import morgan from 'morgan'
import {Server as Socketserver} from 'socket.io'
import http from 'http'
import cors from 'cors'
import mongoose, { mongo } from 'mongoose'
import bodyParser from 'body-parser'
import router from './routes/routes.js'
//import message from './models/message.js'
//import chats from '.models/chats.js'


//Configuración Mongoose
var url = 'mongodb+srv://YaelT02:21300020@cluster0.dfscj.mongodb.net/ChatsUniRoom'
mongoose.Promise = global.Promise

const app = express()
const PORT = 4000

//Creamos el servidor con módulo http
const server = http.createServer(app)

// Configuramos CORS para Socket.io
const io = new Socketserver(server, {
    cors: {
        origin: '*',  // Permitir todas las fuentes (puedes ajustar esto si lo deseas)
        methods: ['GET', 'POST'],  // Métodos permitidos
        credentials: true          // Permitir credenciales (opcional)
    }
});

//Middlewares
app.use(cors())
app.use(morgan('dev'))
app.use(bodyParser.urlencoded({ extended: false}))
app.use(bodyParser.json())
app.use('/api', router)

io.on('connection', (socket) => {
    console.log(`Cliente conectado: ${socket.id}`);
  
    // Evento para unirse a una sala de chat
    socket.on('joinChat', (chatId) => {
      socket.join(chatId);
      console.log(`Cliente ${socket.id} se ha unido al chat: ${chatId}`);
    });
  
    // Evento para recibir y retransmitir mensajes
    socket.on('message', (messageData) => {
      const { chatId, content, nickname } = messageData;
  
      console.log(`Mensaje recibido en el chat ${chatId}:`, content);
  
      // Enviar el mensaje a todos los usuarios de la misma sala, incluyendo el remitente
      io.to(chatId).emit('message', {
        chatId,
        content,
        from: nickname,
      });
    });
  
    // Evento al desconectar un cliente
    socket.on('disconnect', () => {
      console.log(`Cliente desconectado: ${socket.id}`);
    });
  });

// Conexión a la base de datos y escucha del servidor en el puerto 4000
mongoose.connect(url).then(() => {
    console.log('Conexión exitosa a la base de datos');
    server.listen(PORT, () => {
        console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
    });
}).catch((error) => {
    console.error('Error al conectar a la base de datos:', error);
});