import mongoose from 'mongoose';
var Schema = mongoose.Schema;

var MessageSchema = new Schema({
  chatId: { type: Schema.Types.ObjectId, ref: 'Chat' },  // Referencia al chat
  senderId: { type: Schema.Types.ObjectId, ref: 'User' },  // ID del remitente
  content: String,
  nickname: String,
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false }  // Indica si el mensaje ha sido leído
});

export default mongoose.model('Message', MessageSchema);
