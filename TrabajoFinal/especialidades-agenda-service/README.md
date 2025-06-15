# Microservicio de Especialidades y Agendas Médicas

Este microservicio maneja las especialidades médicas, agendas de doctores y la disponibilidad para citas usando Node.js, MongoDB y GraphQL.

## 🚀 Características

- **Gestión de Especialidades**: CRUD completo de especialidades médicas
- **Agendas Médicas**: Configuración de horarios semanales y excepciones
- **Consulta de Disponibilidad**: API GraphQL para consultar disponibilidad por especialidad y médico
- **Sistema de Citas**: Manejo básico de citas médicas
- **Autenticación JWT**: Protección de rutas con roles (cliente, medico, admin)
- **Dockerizado**: Listo para contenedores

## 📋 Requisitos

- Node.js 18+
- MongoDB 6.0+
- Docker y Docker Compose (opcional)

## 🔧 Instalación

### Opción 1: Desarrollo Local

```bash
# Clonar e instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Poblar base de datos con datos de ejemplo
node scripts/seed.js

# Ejecutar en modo desarrollo
npm run dev
```

### Opción 2: Docker

```bash
# Construir y ejecutar con Docker Compose
docker-compose up --build

# Poblar base de datos (en otro terminal)
docker-compose exec medical-schedules-service node scripts/seed.js
```

## 🌐 Endpoints

- **GraphQL Playground**: http://localhost:3002/graphql
- **Health Check**: http://localhost:3002/health

## 📊 Esquema GraphQL

### Queries Principales

```graphql
# Obtener todas las especialidades
query GetSpecialties {
  specialties {
    id
    name
    description
    isActive
  }
}

# Consultar disponibilidad por especialidad
query GetAvailabilityBySpecialty($specialtyId: ID!, $startDate: Date!, $endDate: Date!) {
  availabilityBySpecialty(
    specialtyId: $specialtyId
    startDate: $startDate
    endDate: $endDate
  ) {
    doctorId
    availableSlots {
      date
      startTime
      endTime
    }
  }
}

# Obtener agenda de un doctor
query GetDoctorSchedule($doctorId: String!) {
  doctorSchedule(doctorId: $doctorId) {
    id
    doctorId
    specialties {
      id
      name
    }
    weeklySchedule {
      dayOfWeek
      isWorkingDay
      timeSlots {
        startTime
        endTime
        isAvailable
      }
    }
  }
}
```

### Mutations Principales

```graphql
# Crear especialidad (Admin)
mutation CreateSpecialty($input: SpecialtyInput!) {
  createSpecialty(input: $input) {
    id
    name
    description
  }
}

# Crear agenda médica (Doctor/Admin)
mutation CreateDoctorSchedule($input: DoctorScheduleInput!) {
  createDoctorSchedule(input: $input) {
    id
    doctorId
    specialties {
      name
    }
  }
}

# Crear cita
mutation CreateAppointment($input: AppointmentInput!) {
  createAppointment(input: $input) {
    id
    appointmentDate
    startTime
    endTime
    status
  }
}
```

## 🔐 Autenticación y Autorización

El servicio utiliza JWT para autenticación. Incluye el token en el header:

```
Authorization: Bearer your_jwt_token_here
```

### Roles y Permisos

- **Admin**: Puede gestionar especialidades y todas las agendas
- **Medico**: Puede gestionar su propia agenda y citas
- **Cliente**: Puede crear citas y ver su historial

## 📝 Modelos de Datos

### Specialty (Especialidad)
```javascript
{
  name: String,          // Nombre de la especialidad
  description: String,   // Descripción
  isActive: Boolean,     // Estado activo/inactivo
  createdAt: Date,
  updatedAt: Date
}
```

### DoctorSchedule (Agenda Médica)
```javascript
{
  doctorId: String,           // ID del doctor del microservicio de usuarios
  specialties: [ObjectId],    // Especialidades que atiende
  weeklySchedule: [{          // Horario semanal
    dayOfWeek: Number,        // 0-6 (Domingo-Sábado)
    isWorkingDay: Boolean,
    timeSlots: [{
      startTime: String,      // Formato "HH:MM"
      endTime: String,
      isAvailable: Boolean
    }]
  }],
  exceptions: [{             // Excepciones (feriados, vacaciones)
    date: Date,
    reason: String,
    isAvailable: Boolean,
    customTimeSlots: [TimeSlot]
  }],
  isActive: Boolean
}
```

### Appointment (Cita)
```javascript
{
  doctorId: String,
  patientId: String,
  specialtyId: ObjectId,
  appointmentDate: Date,
  startTime: String,
  endTime: String,
  status: String,           // 'scheduled', 'confirmed', 'cancelled', 'completed'
  notes: String
}
```

## 🧪 Ejemplos de Uso

### 1. Crear una Especialidad
```graphql
mutation {
  createSpecialty(input: {
    name: "Oftalmología"
    description: "Especialidad médica que estudia las enfermedades de los ojos"
  }) {
    id
    name
    description
  }
}
```

### 2. Crear Agenda de Doctor
```graphql
mutation {
  createDoctorSchedule(input: {
    doctorId: "doctor123"
    specialtyIds: ["60f7b3b3b3b3b3b3b3b3b3b3"]
    weeklySchedule: [
      {
        dayOfWeek: 1
        isWorkingDay: true
        timeSlots: [
          {
            startTime: "08:00"
            endTime: "09:00"
            isAvailable: true
          },
          {
            startTime: "09:00"
            endTime: "10:00"
            isAvailable: true
          }
        ]
      }
    ]
  }) {
    id
    doctorId
    specialties {
      name
    }
  }
}
```

### 3. Consultar Disponibilidad
```graphql
query {
  availabilityBySpecialty(
    specialtyId: "60f7b3b3b3b3b3b3b3b3b3b3"
    startDate: "2024-01-15"
    endDate: "2024-01-21"
  ) {
    doctorId
    availableSlots {
      date
      startTime
      endTime
    }
  }
}
```

### 4. Crear Cita
```graphql
mutation {
  createAppointment(input: {
    doctorId: "doctor123"
    patientId: "patient456"
    specialtyId: "60f7b3b3b3b3b3b3b3b3b3b3"
    appointmentDate: "2024-01-15"
    startTime: "08:00"
    endTime: "09:00"
    notes: "Consulta de rutina"
  }) {
    id
    appointmentDate
    startTime
    status
  }
}
```

## 🐳 Docker

### Variables de Entorno para Docker

```yaml
environment:
  - PORT=3002
  - MONGODB_URI=mongodb://mongo:27017/medical_schedules
  - JWT_SECRET=your_jwt_secret_here
  - NODE_ENV=development
```

### Comandos Docker Útiles

```bash
# Construir imagen
docker build -t medical-schedules-service .

# Ejecutar solo el servicio
docker run -p 3002:3002 --env-file .env medical-schedules-service

# Ver logs
docker-compose logs -f medical-schedules-service

# Ejecutar comando en contenedor
docker-compose exec medical-schedules-service npm run seed
```

## 🔧 Configuración de Desarrollo

### Scripts Disponibles

```bash
npm start       # Producción
npm run dev     # Desarrollo con nodemon
npm test        # Ejecutar tests
npm run seed    # Poblar base de datos
```

### Estructura del Proyecto

```
src/
├── models/              # Modelos de MongoDB
│   ├── Specialty.js
│   ├── DoctorSchedule.js
│   └── Appointment.js
├── graphql/             # Esquemas y resolvers GraphQL
│   ├── typeDefs.js
│   └── resolvers.js
├── middleware/          # Middleware de autenticación
│   └── auth.js
└── app.js              # Aplicación principal

scripts/
└── seed.js             # Script para poblar datos

docker-compose.yml      # Configuración Docker
Dockerfile             # Imagen Docker
```

## 🚨 Consideraciones de Seguridad

- Las rutas están protegidas con JWT
- Validación de roles para operaciones sensibles
- Rate limiting implementado (100 requests/15min)
- Sanitización de datos de entrada
- Usuario no-root en contenedor Docker

## 🔗 Integración con Otros Microservicios

Este servicio se integra con:
- **Microservicio de Usuarios**: Para validar doctorId y patientId
- **Microservicio de Citas**: Podría expandirse para manejar citas más complejas

## 📈 Métricas y Monitoreo

- Health check endpoint disponible
- Logs estructurados para monitoreo
- Preparado para integración con sistemas de métricas

## 🛠 Próximas Mejoras Sugeridas

1. **Notificaciones**: Integración con sistema de notificaciones
2. **Recurrencia**: Citas recurrentes
3. **Reportes**: Dashboard de estadísticas
4. **Cache**: Redis para consultas frecuentes
5. **Testing**: Suite completa de tests automatizados