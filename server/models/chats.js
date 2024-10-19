import mongoose from 'mongoose';
var Schema = mongoose.Schema;

var ChatSchema = new Schema({
    chatId: {
        type: Schema.Types.ObjectId,
        required: true,
        unique: true,
        auto: true
    },
    participants: [
        {
            userId: {
                type: Schema.Types.ObjectId,
                required: true
            },
            name: {
                type: String,
                required: true
            },
            isOnline: {
                type: Boolean,
                default: false
            },
            role: {
                type: String,
                enum: ['arrendador', 'huésped'],  // Solo se permite arrendador y huésped
                required: true
            }
        }
    ]
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }  // Añadir automáticamente las fechas de creación y actualización
});

export default mongoose.model('Chat', ChatSchema);
