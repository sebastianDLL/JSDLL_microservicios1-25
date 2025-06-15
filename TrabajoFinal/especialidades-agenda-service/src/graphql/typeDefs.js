const { gql } = require("apollo-server-express");

const typeDefs = gql`
  scalar Date
  scalar DateTime

  type Specialty {
    id: ID!
    name: String!
    description: String!
    isActive: Boolean!
    createdAt: Date!
    updatedAt: Date!
  }

  type TimeSlot {
    startTime: String!
    endTime: String!
    isAvailable: Boolean!
  }

  type DailySchedule {
    dayOfWeek: Int!
    timeSlots: [TimeSlot!]!
    isWorkingDay: Boolean!
  }

  type ScheduleException {
    date: Date!
    reason: String
    isAvailable: Boolean!
    customTimeSlots: [TimeSlot!]
  }

  type DoctorSchedule {
    id: ID!
    doctorId: String!
    specialties: [Specialty!]!
    weeklySchedule: [DailySchedule!]!
    exceptions: [ScheduleException!]!
    isActive: Boolean!
    createdAt: Date!
    updatedAt: Date!
  }

  type AvailableSlot {
    date: Date!
    startTime: String!
    endTime: String!
    doctorId: String!
    specialtyId: ID!
  }

  type DoctorAvailability {
    doctorId: String!
    specialtyId: ID!
    availableSlots: [AvailableSlot!]!
  }

  type Appointment {
    id: ID!
    doctorId: String!
    patientId: String!
    specialty: Specialty!
    appointmentDate: Date!
    startTime: String!
    endTime: String!
    status: String!
    notes: String
    createdAt: Date!
    updatedAt: Date!
  }

  input SpecialtyInput {
    name: String!
    description: String!
  }

  input TimeSlotInput {
    startTime: String!
    endTime: String!
    isAvailable: Boolean = true
  }

  input DailyScheduleInput {
    dayOfWeek: Int!
    timeSlots: [TimeSlotInput!]!
    isWorkingDay: Boolean = true
  }

  input ScheduleExceptionInput {
    date: Date!
    reason: String
    isAvailable: Boolean = false
    customTimeSlots: [TimeSlotInput!]
  }

  input DoctorScheduleInput {
    doctorId: String!
    specialtyIds: [ID!]!
    weeklySchedule: [DailyScheduleInput!]!
  }

  input AppointmentInput {
    doctorId: String!
    patientId: String!
    specialtyId: ID!
    appointmentDate: Date!
    startTime: String!
    endTime: String!
    notes: String
  }

  type Query {
    # Especialidades
    specialties: [Specialty!]!
    specialty(id: ID!): Specialty

    # Agendas médicas
    doctorSchedule(doctorId: String!): DoctorSchedule
    doctorSchedules: [DoctorSchedule!]!

    # Disponibilidad
    availabilityBySpecialty(
      specialtyId: ID!
      startDate: Date!
      endDate: Date!
    ): [DoctorAvailability!]!

    availabilityByDoctor(
      doctorId: String!
      startDate: Date!
      endDate: Date!
    ): [AvailableSlot!]!

    # Citas
    appointments(
      doctorId: String
      patientId: String
      startDate: Date
      endDate: Date
      status: String
    ): [Appointment!]!

    appointment(id: ID!): Appointment
  }

  type Mutation {
    # Especialidades
    createSpecialty(input: SpecialtyInput!): Specialty!
    updateSpecialty(id: ID!, input: SpecialtyInput!): Specialty!
    deactivateSpecialty(id: ID!): Specialty!

    # Agendas médicas
    createDoctorSchedule(input: DoctorScheduleInput!): DoctorSchedule!
    updateDoctorSchedule(
      doctorId: String!
      input: DoctorScheduleInput!
    ): DoctorSchedule!
    addScheduleException(
      doctorId: String!
      exception: ScheduleExceptionInput!
    ): DoctorSchedule!
    deleteDoctorSchedule(doctorId: String!): DoctorSchedule!

    # Citas
    createAppointment(input: AppointmentInput!): Appointment!
    updateAppointmentStatus(id: ID!, status: String!): Appointment!
    cancelAppointment(id: ID!, reason: String): Appointment!
  }
`;

module.exports = typeDefs;
