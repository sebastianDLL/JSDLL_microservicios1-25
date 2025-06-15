const mongoose = require('mongoose');
const Specialty = require('../src/models/Specialty');
const DoctorSchedule = require('../src/models/DoctorSchedule');
require('dotenv').config();

const specialtiesData = [
  {
    name: 'Cardiología',
    description: 'Especialidad médica que se ocupa del diagnóstico y tratamiento de las enfermedades del corazón'
  },
  {
    name: 'Neurología',
    description: 'Especialidad médica que trata los trastornos del sistema nervioso'
  },
  {
    name: 'Pediatría',
    description: 'Especialidad médica que se centra en la atención médica de bebés, niños y adolescentes'
  },
  {
    name: 'Dermatología',
    description: 'Especialidad médica dedicada al estudio de la piel y sus enfermedades'
  },
  {
    name: 'Ginecología',
    description: 'Especialidad médica que se ocupa del sistema reproductivo femenino'
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Limpiar datos existentes
    await Specialty.deleteMany({});
    await DoctorSchedule.deleteMany({});

    // Insertar especialidades
    const specialties = await Specialty.insertMany(specialtiesData);
    console.log('✅ Especialidades creadas:', specialties.length);

    // Crear agenda ejemplo para un doctor
    const sampleSchedule = new DoctorSchedule({
      doctorId: 'doctor123', // ID de ejemplo del microservicio de usuarios
      specialties: [
        { specialtyId: specialties[0]._id }, // Cardiología
        { specialtyId: specialties[1]._id }  // Neurología
      ],
      weeklySchedule: [
        {
          dayOfWeek: 1, // Lunes
          isWorkingDay: true,
          timeSlots: [
            { startTime: '08:00', endTime: '09:00', isAvailable: true },
            { startTime: '09:00', endTime: '10:00', isAvailable: true },
            { startTime: '10:00', endTime: '11:00', isAvailable: true },
            { startTime: '14:00', endTime: '15:00', isAvailable: true },
            { startTime: '15:00', endTime: '16:00', isAvailable: true }
          ]
        },
        {
          dayOfWeek: 2, // Martes
          isWorkingDay: true,
          timeSlots: [
            { startTime: '08:00', endTime: '09:00', isAvailable: true },
            { startTime: '09:00', endTime: '10:00', isAvailable: true },
            { startTime: '10:00', endTime: '11:00', isAvailable: true }
          ]
        },
        {
          dayOfWeek: 3, // Miércoles
          isWorkingDay: true,
          timeSlots: [
            { startTime: '14:00', endTime: '15:00', isAvailable: true },
            { startTime: '15:00', endTime: '16:00', isAvailable: true },
            { startTime: '16:00', endTime: '17:00', isAvailable: true }
          ]
        },
        {
          dayOfWeek: 4, // Jueves
          isWorkingDay: true,
          timeSlots: [
            { startTime: '08:00', endTime: '09:00', isAvailable: true },
            { startTime: '09:00', endTime: '10:00', isAvailable: true }
          ]
        },
        {
          dayOfWeek: 5, // Viernes
          isWorkingDay: true,
          timeSlots: [
            { startTime: '08:00', endTime: '09:00', isAvailable: true },
            { startTime: '09:00', endTime: '10:00', isAvailable: true },
            { startTime: '10:00', endTime: '11:00', isAvailable: true }
          ]
        },
        {
          dayOfWeek: 6, // Sábado
          isWorkingDay: false,
          timeSlots: []
        },
        {
          dayOfWeek: 0, // Domingo
          isWorkingDay: false,
          timeSlots: []
        }
      ]
    });

    await sampleSchedule.save();
    console.log('✅ Agenda de ejemplo creada');

    console.log('🌱 Base de datos poblada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error poblando la base de datos:', error);
    process.exit(1);
  }
};

seedDatabase();