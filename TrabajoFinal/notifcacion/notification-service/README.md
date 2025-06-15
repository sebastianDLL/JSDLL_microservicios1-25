# Servicio de Notificaciones con RabbitMQ - Windows

Este servicio maneja las notificaciones por email (mock) para reservas médicas utilizando RabbitMQ como sistema de colas.

## 🪟 Requisitos para Windows

- **Docker Desktop** instalado y ejecutándose
- **Python 3.9+** (opcional, para scripts de prueba)
- **PowerShell** (recomendado) o **Command Prompt**

## 📁 Instalación en Windows

### 1. Crear el proyecto

```powershell
# En PowerShell
mkdir notification-service
cd notification-service
```

```cmd
:: En Command Prompt
mkdir notification-service
cd notification-service
```

### 2. Crear todos los archivos

Crear la siguiente estructura de carpetas y archivos:

```
notification-service/
├── app/
│   └── main.py              # Aplicación principal
├── requirements.txt         # Dependencias Python
├── Dockerfile              # Configuración Docker
├── docker-compose.yml      # Orquestación de servicios
├── publisher_example.py    # Ejemplo de cómo enviar mensajes
├── run.ps1                 # Script de PowerShell
├── run.bat                 # Script de Batch (alternativa)
├── .env                    # Variables de entorno
└── README.md              # Esta documentación
```

### 3. Iniciar los servicios

**Opción 1: Con PowerShell (Recomendado)**
```powershell
# Iniciar servicios
.\run.ps1 -Action start

# Ver logs
.\run.ps1 -Action logs

# Enviar mensaje de prueba
.\run.ps1 -Action test

# Detener servicios
.\run.ps1 -Action stop
```

**Opción 2: Con Batch**
```cmd
:: Iniciar servicios
run.bat start

:: Ver logs
run.bat logs

:: Enviar mensaje de prueba
run.bat test

:: Detener servicios
run.bat stop
```

**Opción 3: Comandos Docker directos**
```cmd
:: Iniciar
docker-compose up -d

:: Ver logs
docker-compose logs -f

:: Detener
docker-compose down
```

## 🔧 Configuración en Windows

### Variables de Entorno (.env)
```env
RABBITMQ_URL=amqp://admin:password123@rabbitmq:5672/
EMAIL_USER=notifications@hospital.com
EMAIL_PASSWORD=mock_password
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
```

### Si usas WSL2 con Docker
Si tienes Docker Desktop configurado con WSL2, todo debería funcionar igual. Solo asegúrate de que Docker Desktop esté ejecutándose.

## 🚀 Uso desde otros servicios en Windows

### Ejemplo con Python en Windows:

```python
# install_dependencies.bat
pip install pika

# send_message.py
import pika
import json

def enviar_notificacion():
    # En Windows, usar localhost en lugar de rabbitmq si ejecutas fuera de Docker
    rabbitmq_url = "amqp://admin:password123@localhost:5672/"
    
    connection = pika.BlockingConnection(pika.URLParameters(rabbitmq_url))
    channel = connection.channel()
    
    mensaje = {
        "type": "reservation_created",
        "patient_email": "paciente@email.com",
        "patient_name": "Juan Pérez",
        "doctor_email": "doctor@hospital.com",
        "doctor_name": "Dr. María García",
        "appointment_date": "2025-06-15",
        "appointment_time": "10:30",
        "reservation_id": "RES-001"
    }
    
    channel.basic_publish(
        exchange='',
        routing_key='medical_notifications',
        body=json.dumps(mensaje, ensure_ascii=False),
        properties=pika.BasicProperties(delivery_mode=2)
    )
    
    print("✅ Mensaje enviado correctamente")
    connection.close()

if __name__ == "__main__":
    enviar_notificacion()
```

### Ejemplo con .NET/C#:

```csharp
// Agregar NuGet: RabbitMQ.Client
using RabbitMQ.Client;
using System.Text;
using System.Text.Json;

var factory = new ConnectionFactory() 
{ 
    HostName = "localhost",
    Port = 5672,
    UserName = "admin",
    Password = "password123"
};

using var connection = factory.CreateConnection();
using var channel = connection.CreateModel();

var mensaje = new
{
    type = "reservation_created",
    patient_email = "paciente@email.com",
    patient_name = "Juan Pérez",
    doctor_email = "doctor@hospital.com",
    doctor_name = "Dr. María García",
    appointment_date = "2025-06-15",
    appointment_time = "10:30",
    reservation_id = "RES-001"
};

var json = JsonSerializer.Serialize(mensaje);
var body = Encoding.UTF8.GetBytes(json);

channel.BasicPublish(
    exchange: "",
    routingKey: "medical_notifications",
    body: body
);

Console.WriteLine("✅ Mensaje enviado correctamente");
```

## 🌐 Accesos en Windows

- **Servicio de Notificaciones**: http://localhost:8080
- **RabbitMQ Management**: http://localhost:15672
  - Usuario: `admin`
  - Contraseña: `password123`

## 🛠️ Comandos Útiles para Windows

### PowerShell:
```powershell
# Ver logs específicos
.\run.ps1 -Action logs -Service notification-service
.\run.ps1 -Action logs -Service rabbitmq

# Limpiar todo
.\run.ps1 -Action clean

# Reconstruir imágenes
.\run.ps1 -Action build
```

### Command Prompt:
```cmd
:: Ver logs específicos
run.bat logs notification-service
run.bat logs rabbitmq

:: Limpiar todo
run.bat clean

:: Reconstruir imágenes
run.bat build
```

### Docker directo:
```cmd
:: Ver estado de contenedores
docker ps

:: Ver logs en tiempo real
docker-compose logs -f notification-service

:: Ejecutar comando dentro del contenedor
docker exec -it notification-service bash

:: Ver uso de recursos
docker stats
```

## 🐛 Solución de Problemas en Windows

### Docker Desktop no está ejecutándose:
```cmd
:: Verificar que Docker está corriendo
docker --version
docker-compose --version
```

### Puerto ocupado:
```cmd
:: Ver qué está usando el puerto 8080
netstat -ano | findstr :8080

:: Ver qué está usando el puerto 5672
netstat -ano | findstr :5672
```

### Problemas de permisos en PowerShell:
```powershell
# Si PowerShell bloquea la ejecución de scripts
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Verificar que todo funciona:
```cmd
:: Verificar servicios
curl http://localhost:8080/health

:: O en PowerShell
Invoke-RestMethod http://localhost:8080/health
```

## 📝 Notas Importantes para Windows

1. **Docker Desktop debe estar ejecutándose** antes de usar los comandos
2. **Los paths de Windows usan backslash** (`\`) pero Docker Compose maneja esto automáticamente
3. **PowerShell es más potente** que Command Prompt para este tipo de tareas
4. **Los logs se muestran en tiempo real** con colores en PowerShell
5. **Para conectar desde fuera de Docker**, usa `localhost` en lugar de `rabbitmq`

¡Ya tienes todo listo para Windows! 🎉