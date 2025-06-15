const Specialty = require("../models/Specialty");
const DoctorSchedule = require("../models/DoctorSchedule");
const Appointment = require("../models/Appointment");
const { DateTimeResolver, DateResolver } = require("graphql-scalars");
const moment = require("moment");

const resolvers = {
  Date: DateResolver,
  DateTime: DateTimeResolver,

  Query: {
    // Especialidades
    specialties: async () => {
      return await Specialty.find({ isActive: true }).sort({ name: 1 });
    },

    specialty: async (_, { id }) => {
      return await Specialty.findById(id);
    },

    // Agendas médicas
    doctorSchedule: async (_, { doctorId }) => {
      const schedule = await DoctorSchedule.findOne({
        doctorId,
        isActive: true,
      }).populate("specialties.specialtyId");
      return schedule;
    },

    doctorSchedules: async () => {
      return await DoctorSchedule.find({ isActive: true }).populate(
        "specialties.specialtyId"
      );
    },

    // Disponibilidad por especialidad
    availabilityBySpecialty: async (_, { specialtyId, startDate, endDate }) => {
      const schedules = await DoctorSchedule.find({
        "specialties.specialtyId": specialtyId,
        isActive: true,
      }).populate("specialties.specialtyId");

      const availability = [];

      for (const schedule of schedules) {
        const slots = await generateAvailableSlots(
          schedule,
          specialtyId,
          startDate,
          endDate
        );

        if (slots.length > 0) {
          availability.push({
            doctorId: schedule.doctorId,
            specialtyId,
            availableSlots: slots,
          });
        }
      }

      return availability;
    },

    // Disponibilidad por doctor
    availabilityByDoctor: async (_, { doctorId, startDate, endDate }) => {
      const schedule = await DoctorSchedule.findOne({
        doctorId,
        isActive: true,
      });

      if (!schedule) return [];

      const allSlots = [];
      for (const specialty of schedule.specialties) {
        const slots = await generateAvailableSlots(
          schedule,
          specialty.specialtyId,
          startDate,
          endDate
        );
        allSlots.push(...slots);
      }

      return allSlots;
    },

    // Citas
    appointments: async (
      _,
      { doctorId, patientId, startDate, endDate, status }
    ) => {
      const filter = {};

      if (doctorId) filter.doctorId = doctorId;
      if (patientId) filter.patientId = patientId;
      if (status) filter.status = status;

      if (startDate && endDate) {
        filter.appointmentDate = {
          $gte: startDate,
          $lte: endDate,
        };
      }

      return await Appointment.find(filter)
        .populate("specialtyId")
        .sort({ appointmentDate: 1, startTime: 1 });
    },

    appointment: async (_, { id }) => {
      return await Appointment.findById(id).populate("specialtyId");
    },
  },

  Mutation: {
    // Especialidades
    createSpecialty: async (_, { input }, { user }) => {
      if (!user || user.role !== "admin") {
        throw new Error("No autorizado: se requiere rol de administrador");
      }

      const specialty = new Specialty(input);
      return await specialty.save();
    },

    updateSpecialty: async (_, { id, input }, { user }) => {
      if (!user || user.role !== "admin") {
        throw new Error("No autorizado: se requiere rol de administrador");
      }

      return await Specialty.findByIdAndUpdate(id, input, { new: true });
    },

    deactivateSpecialty: async (_, { id }, { user }) => {
      if (!user || user.role !== "admin") {
        throw new Error("No autorizado: se requiere rol de administrador");
      }

      return await Specialty.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
      );
    },

    // Agendas médicas
    createDoctorSchedule: async (_, { input }, { user }) => {
      if (!user) {
        throw new Error("No autorizado");
      }

      // Verificar si ya existe un horario para este doctor
      const existingSchedule = await DoctorSchedule.findOne({
        doctorId: input.doctorId,
        isActive: true,
      });

      if (existingSchedule) {
        throw new Error("Ya existe un horario activo para este doctor");
      }

      const scheduleData = {
        doctorId: input.doctorId,
        specialties: input.specialtyIds.map((id) => ({ specialtyId: id })),
        weeklySchedule: input.weeklySchedule.map((day) => ({
          ...day,
          timeSlots: day.timeSlots.map((slot) => ({
            ...slot,
            isAvailable:
              slot.isAvailable !== undefined ? slot.isAvailable : true,
          })),
        })),
        exceptions: [],
      };

      const schedule = new DoctorSchedule(scheduleData);
      await schedule.save();

      return await DoctorSchedule.findById(schedule._id).populate(
        "specialties.specialtyId"
      );
    },

    updateDoctorSchedule: async (_, { doctorId, input }, { user }) => {
      if (!user) {
        throw new Error("No autorizado: se requiere autenticación");
      }

      // Construir el objeto de actualización solo con los campos presentes en input
      const updateData = {};
      if (input.specialtyIds) {
        updateData.specialties = input.specialtyIds.map((id) => ({
          specialtyId: id,
        }));
      }
      if (input.weeklySchedule) {
        updateData.weeklySchedule = input.weeklySchedule.map((day) => ({
          ...day,
          timeSlots: day.timeSlots.map((slot) => ({
            ...slot,
            isAvailable:
              slot.isAvailable !== undefined ? slot.isAvailable : true,
          })),
        }));
      }

      // Actualizar el documento y devolver el resultado actualizado con populate
      const updated = await DoctorSchedule.findOneAndUpdate(
        { doctorId },
        { $set: updateData },
        { new: true }
      ).populate("specialties.specialtyId");

      if (!updated) {
        throw new Error("Horario no encontrado");
      }

      return updated;
    },

    deleteDoctorSchedule: async (_, { doctorId }, { user }) => {
      if (!user) {
        throw new Error("No autorizado: se requiere autenticación");
      }

      const deleted = await DoctorSchedule.findOneAndDelete({ doctorId });
      if (!deleted) {
        throw new Error("Horario no encontrado");
      }
      return deleted;
    },

    addScheduleException: async (_, { doctorId, exception }, { user }) => {
      if (!user) {
        throw new Error("No autorizado: se requiere autenticación");
      }

      if (user.role === "medico" && user.id !== doctorId) {
        throw new Error(
          "No autorizado: solo puedes modificar tu propia agenda"
        );
      }

      return await DoctorSchedule.findOneAndUpdate(
        { doctorId },
        { $push: { exceptions: exception } },
        { new: true }
      ).populate("specialties.specialtyId");
    },

    // Citas
    createAppointment: async (_, { input }, { user }) => {
      if (!user) {
        throw new Error("No autorizado: se requiere autenticación");
      }

      // Verificar disponibilidad
      const isAvailable = await checkTimeSlotAvailability(
        input.doctorId,
        input.appointmentDate,
        input.startTime
      );

      if (!isAvailable) {
        throw new Error("El horario seleccionado no está disponible");
      }

      const appointment = new Appointment(input);
      return await appointment.save();
    },

    updateAppointmentStatus: async (_, { id, status }, { user }) => {
      if (!user) {
        throw new Error("No autorizado: se requiere autenticación");
      }

      const appointment = await Appointment.findById(id);
      if (!appointment) {
        throw new Error("Cita no encontrada");
      }

      // Verificar permisos
      if (user.role === "cliente" && user.id !== appointment.patientId) {
        throw new Error(
          "No autorizado: solo puedes modificar tus propias citas"
        );
      }

      if (user.role === "medico" && user.id !== appointment.doctorId) {
        throw new Error(
          "No autorizado: solo puedes modificar citas de tus pacientes"
        );
      }

      return await Appointment.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      ).populate("specialtyId");
    },

    cancelAppointment: async (_, { id, reason }, { user }) => {
      if (!user) {
        throw new Error("No autorizado: se requiere autenticación");
      }

      const appointment = await Appointment.findById(id);
      if (!appointment) {
        throw new Error("Cita no encontrada");
      }

      // Verificar permisos
      if (user.role === "cliente" && user.id !== appointment.patientId) {
        throw new Error(
          "No autorizado: solo puedes cancelar tus propias citas"
        );
      }

      if (user.role === "medico" && user.id !== appointment.doctorId) {
        throw new Error(
          "No autorizado: solo puedes cancelar citas de tus pacientes"
        );
      }

      const updateData = {
        status: "cancelled",
        notes: reason ? `Cancelada: ${reason}` : "Cancelada",
      };

      return await Appointment.findByIdAndUpdate(id, updateData, {
        new: true,
      }).populate("specialtyId");
    },
  },

  // Resolvers de relaciones
  DoctorSchedule: {
    specialties: async (parent) => {
      await parent.populate("specialties.specialtyId");
      return parent.specialties.map((s) => s.specialtyId);
    },
  },

  Appointment: {
    specialty: async (parent) => {
      return await Specialty.findById(parent.specialtyId);
    },
  },
};

// Función auxiliar para generar slots disponibles
async function generateAvailableSlots(
  schedule,
  specialtyId,
  startDate,
  endDate
) {
  const slots = [];
  const start = moment(startDate);
  const end = moment(endDate);

  // Obtener citas existentes para el período
  const existingAppointments = await Appointment.find({
    doctorId: schedule.doctorId,
    appointmentDate: { $gte: startDate, $lte: endDate },
    status: { $in: ["scheduled", "confirmed"] },
  });

  const current = start.clone();
  while (current.isSameOrBefore(end)) {
    const dayOfWeek = current.day();
    const dateStr = current.format("YYYY-MM-DD");

    // Buscar excepción para esta fecha
    const exception = schedule.exceptions.find(
      (exc) => moment(exc.date).format("YYYY-MM-DD") === dateStr
    );

    let timeSlots = [];

    if (exception) {
      if (exception.isAvailable && exception.customTimeSlots) {
        timeSlots = exception.customTimeSlots;
      }
    } else {
      // Usar horario regular
      const dailySchedule = schedule.weeklySchedule.find(
        (ds) => ds.dayOfWeek === dayOfWeek
      );
      if (dailySchedule && dailySchedule.isWorkingDay) {
        timeSlots = dailySchedule.timeSlots;
      }
    }

    // Filtrar slots ocupados
    for (const slot of timeSlots) {
      if (slot.isAvailable) {
        const isOccupied = existingAppointments.some(
          (apt) =>
            moment(apt.appointmentDate).format("YYYY-MM-DD") === dateStr &&
            apt.startTime === slot.startTime
        );

        if (!isOccupied) {
          slots.push({
            date: current.toDate(),
            startTime: slot.startTime,
            endTime: slot.endTime,
            doctorId: schedule.doctorId,
            specialtyId,
          });
        }
      }
    }

    current.add(1, "day");
  }

  return slots;
}

// Función auxiliar para verificar disponibilidad
async function checkTimeSlotAvailability(doctorId, appointmentDate, startTime) {
  const existingAppointment = await Appointment.findOne({
    doctorId,
    appointmentDate,
    startTime,
    status: { $in: ["scheduled", "confirmed"] },
  });

  return !existingAppointment;
}

module.exports = resolvers;
