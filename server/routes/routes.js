import express from 'express';
import controller from '../controllers/ChatController.js';

var router = express.Router();

// Rutas para la gestión de mensajes
router.post('/save', controller.save);  // Guardar un mensaje
router.get('/messages/:chatId', controller.getMessages);  // Obtener mensajes de un chat específico

// Rutas para la gestión de chats
router.post('/create-chat', controller.createChat);  // Crear un nuevo chat
router.get('/chats', controller.getAllChats); //Obtener todos los chats
router.post('/find-or-create-chat', controller.findOrCreateChat);  // Buscar o crear un chat

export default router;
