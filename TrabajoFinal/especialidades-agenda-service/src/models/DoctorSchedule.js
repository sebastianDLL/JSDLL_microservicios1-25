const mongoose = require("mongoose");

const timeSlotSchema = new mongoose.Schema({
  startTime: {
    type: String, // formato "HH:MM"
    required: true,
  },
  endTime: {
    type: String, // formato "HH:MM"
    required: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
});

const dailyScheduleSchema = new mongoose.Schema({
  dayOfWeek: {
    type: Number, // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    required: true,
    min: 0,
    max: 6,
  },
  timeSlots: [timeSlotSchema],
  isWorkingDay: {
    type: Boolean,
    default: true,
  },
});

const doctorScheduleSchema = new mongoose.Schema({
  doctorId: {
    type: String, // ID del doctor del microservicio de usuarios
    required: true,
    index: true,
  },
  specialties: [
    {
      specialtyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Specialty",
        required: true,
      },
    },
  ],
  weeklySchedule: [dailyScheduleSchema],
  exceptions: [
    {
      date: {
        type: Date,
        required: true,
      },
      reason: String,
      isAvailable: {
        type: Boolean,
        default: false,
      },
      customTimeSlots: [timeSlotSchema],
    },
  ],
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Índices para mejorar consultas
doctorScheduleSchema.index({ doctorId: 1, "specialties.specialtyId": 1 });
doctorScheduleSchema.index({ "exceptions.date": 1 });

doctorScheduleSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("DoctorSchedule", doctorScheduleSchema);
