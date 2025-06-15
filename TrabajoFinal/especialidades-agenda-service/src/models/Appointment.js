const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  doctorId: {
    type: String,
    required: true,
    index: true,
  },
  patientId: {
    type: String,
    required: true,
    index: true,
  },
  specialtyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Specialty",
    required: true,
  },
  appointmentDate: {
    type: Date,
    required: true,
    index: true,
  },
  startTime: {
    type: String, // formato "HH:MM"
    required: true,
  },
  endTime: {
    type: String, // formato "HH:MM"
    required: true,
  },
  status: {
    type: String,
    enum: ["scheduled", "confirmed", "cancelled", "completed"],
    default: "scheduled",
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Índice compuesto para evitar citas duplicadas
appointmentSchema.index(
  {
    doctorId: 1,
    appointmentDate: 1,
    startTime: 1,
  },
  { unique: true }
);

appointmentSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Appointment", appointmentSchema);
