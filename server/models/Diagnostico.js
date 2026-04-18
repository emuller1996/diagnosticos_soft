import mongoose from 'mongoose';

const DiagnosticoSchema = new mongoose.Schema({
  titular: {
    nombre: { type: String, required: true },
    apellido: { type: String, required: true },
    documento: { type: String, required: true, unique: true },
    celular: { type: String, required: true },
  },
  modalidad: {
    type: { 
      type: String, 
      enum: ['vivienda nueva', 'mejoramiento'], 
      required: true 
    },
  },
  actividadProductiva: {
    tiene: { type: Boolean, default: false },
    tipo: { type: String },
    descripcion: { type: String },
  },
  nivelEducativo: { type: String, required: true },
  numeroPersonas: { type: Number, required: true },
  numeroHogares: { type: Number, required: true },
  numeroHabitaciones: { type: Number, required: true },
  numeroCuartos: { type: Number, required: true },
  tenenciaPredio: {
    tipo: { type: String, required: true }, // Options: Propia, Arrendada, etc.
    otro: { type: String },
  },
  condicionesAmbientales: [
    {
      condicion: { type: String, required: true },
      cumple: { type: Boolean, required: true },
      causa: { type: String },
    }
  ],
  estado: { type: String, default: 'activo' },
}, { timestamps: true });

export default mongoose.model('Diagnostico', DiagnosticoSchema);