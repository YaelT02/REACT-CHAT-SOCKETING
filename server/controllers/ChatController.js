import mongoose from 'mongoose';

import Message from '../models/message.js';
import Chat from '../models/chats.js';

var controller = {
  // Función para guardar un mensaje
  save: async (req, res) => {
    try {
      const { chatId, content, nickname } = req.body;
  
      // Generar automáticamente el senderId como un ObjectId de MongoDB
      const senderId = new mongoose.Types.ObjectId();
  
      const newMessage = new Message({
        chatId,
        senderId,
        nickname,
        content,
        timestamp: new Date(),
        isRead: false,
      });
  
      const savedMessage = await newMessage.save();
  
      res.status(200).json({ status: 'success', message: savedMessage });
    } catch (error) {
      console.error('Error al guardar el mensaje:', error);
      res.status(500).json({ status: 'error', message: 'Error al guardar el mensaje' });
    }
  },

  // Función para obtener todos los mensajes de un chat
  getMessages: async (req, res) => {
    try {
      const { chatId } = req.params;

      // Obtener todos los mensajes de un chat
      const messages = await Message.find({ chatId }).sort('-timestamp').exec();

      if (!messages || messages.length === 0) {
        return res.status(404).send({
          status: 'error',
          message: 'No hay mensajes que mostrar'
        });
      }

      return res.status(200).send({
        status: 'Success',
        messages
      });
    } catch (error) {
      return res.status(500).send({
        status: 'error',
        message: 'No se han podido obtener los datos'
      });
    }
  },

 // Método para crear un chat
 createChat: async (req, res) => {
  try {
    const { participants } = req.body;

    // Validar que haya exactamente dos participantes
    if (participants.length !== 2) {
      return res.status(400).send({
        status: 'error',
        message: 'Un chat debe tener exactamente dos participantes: un arrendador y un huésped.',
      });
    }

    // Validar los roles: debe haber un arrendador y un huésped
    const roles = participants.map((participant) => participant.role);
    if (!roles.includes('arrendador') || !roles.includes('huésped')) {
      return res.status(400).send({
        status: 'error',
        message: 'El chat debe ser entre un arrendador y un huésped.',
      });
    }

    // Generar userId automáticamente como ObjectId para cada participante
    const updatedParticipants = participants.map((participant) => ({
      ...participant,
      userId: new mongoose.Types.ObjectId(), // Generar un ObjectId automáticamente
    }));

    // Crear el nuevo chat respetando la estructura original
    const chat = new Chat({ participants: updatedParticipants });
    const chatStored = await chat.save();

    return res.status(200).send({
      status: 'Success',
      chat: chatStored,
    });
  } catch (error) {
    console.error('Error al crear el chat:', error);
    return res.status(500).send({
      status: 'error',
      message: 'Error al crear el chat: ' + error.message,
    });
  }
},

// Método para obtener todos los chats
getAllChats: async (req, res) => {
  try {
    const chats = await Chat.find({}).sort('-createdAt').exec();

    if (!chats || chats.length === 0) {
      return res.status(404).send({
        status: 'error',
        message: 'No se encontraron chats.'
      });
    }

    return res.status(200).send({
      status: 'Success',
      chats
    });
  } catch (error) {
    return res.status(500).send({
      status: 'error',
      message: 'Error al obtener los chats'
    });
  }
},

// Método para buscar o crear un chat
findOrCreateChat: async (req, res) => {
  try {
    const { role, name } = req.body;

    // Buscar si ya existe un chat con un arrendador y un huésped
    let chat = await Chat.findOne({
      participants: { $elemMatch: { role: role === 'arrendador' ? 'huésped' : 'arrendador' } },
    });

    if (!chat) {
      // Si no existe el chat, crear uno nuevo
      const participants = [
        { userId: new mongoose.Types.ObjectId(), name, role, isOnline: true },
        { userId: new mongoose.Types.ObjectId(), name: 'Pendiente', role: role === 'arrendador' ? 'huésped' : 'arrendador', isOnline: false }
      ];
      chat = new Chat({ participants });
      await chat.save();
    } else {
      // Actualizar el estado del participante en el chat encontrado
      const participantIndex = chat.participants.findIndex(p => p.role === role);
      if (participantIndex !== -1) {
        chat.participants[participantIndex].name = name;
        chat.participants[participantIndex].isOnline = true;
      } else {
        // Agregar un nuevo participante si no existe en el chat encontrado
        chat.participants.push({
          userId: new mongoose.Types.ObjectId(),
          name,
          role,
          isOnline: true,
        });
      }
      await chat.save();
    }

    return res.status(200).send({
      status: 'Success',
      chat
    });
  } catch (error) {
    console.error('Error al buscar o crear el chat:', error);
    return res.status(500).send({
      status: 'error',
      message: 'Error al buscar o crear el chat'
    });
  }
}

  }

export default controller;
