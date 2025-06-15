import asyncio
import json
import logging
import os
from datetime import datetime
from typing import Dict, Any

import pika
from fastapi import FastAPI
from pydantic import BaseModel
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Configuración de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Servicio de Notificaciones", version="1.0.0")

# Modelos Pydantic
class NotificationMessage(BaseModel):
    type: str  # "reservation_created", "reservation_cancelled"
    patient_email: str
    patient_name: str
    doctor_email: str
    doctor_name: str
    appointment_date: str
    appointment_time: str
    reservation_id: str

class EmailService:
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.email_user = os.getenv("EMAIL_USER", "notifications@hospital.com")
        self.email_password = os.getenv("EMAIL_PASSWORD", "mock_password")
    
    async def send_mock_email(self, to_email: str, subject: str, body: str):
        """Mock del envío de email - solo logea el contenido"""
        logger.info(f"""
        ========== MOCK EMAIL ==========
        TO: {to_email}
        SUBJECT: {subject}
        BODY: {body}
        TIMESTAMP: {datetime.now()}
        ===============================
        """)
        
        # Simulamos un pequeño delay como si enviáramos el email real
        await asyncio.sleep(0.5)
        return True

class NotificationService:
    def __init__(self):
        self.email_service = EmailService()
        self.rabbitmq_url = os.getenv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/")
        self.queue_name = "medical_notifications"
        
    def get_rabbitmq_connection(self):
        """Establece conexión con RabbitMQ con reintentos"""
        max_retries = 5
        for attempt in range(max_retries):
            try:
                connection = pika.BlockingConnection(
                    pika.URLParameters(self.rabbitmq_url)
                )
                logger.info("Conexión exitosa a RabbitMQ")
                return connection
            except Exception as e:
                logger.warning(f"Intento {attempt + 1} fallido: {e}")
                if attempt < max_retries - 1:
                    asyncio.sleep(2 ** attempt)  # Backoff exponencial
                else:
                    raise
    
    def setup_queue(self):
        """Configura la cola de RabbitMQ"""
        connection = self.get_rabbitmq_connection()
        channel = connection.channel()
        
        # Declarar la cola (se crea si no existe)
        channel.queue_declare(
            queue=self.queue_name,
            durable=True  # La cola sobrevive a reinicios del servidor
        )
        
        logger.info(f"Cola '{self.queue_name}' configurada correctamente")
        connection.close()
    
    async def process_notification(self, message_data: Dict[str, Any]):
        """Procesa un mensaje de notificación"""
        try:
            notification = NotificationMessage(**message_data)
            
            if notification.type == "reservation_created":
                await self._send_reservation_created_notifications(notification)
            elif notification.type == "reservation_cancelled":
                await self._send_reservation_cancelled_notifications(notification)
            else:
                logger.warning(f"Tipo de notificación desconocido: {notification.type}")
                
        except Exception as e:
            logger.error(f"Error procesando notificación: {e}")
    
    async def _send_reservation_created_notifications(self, notification: NotificationMessage):
        """Envía notificaciones cuando se crea una reserva"""
        
        # Notificación al paciente
        patient_subject = "Confirmación de Cita Médica"
        patient_body = f"""
        Estimado/a {notification.patient_name},
        
        Su cita médica ha sido confirmada con los siguientes detalles:
        
        • Doctor: {notification.doctor_name}
        • Fecha: {notification.appointment_date}
        • Hora: {notification.appointment_time}
        • ID de Reserva: {notification.reservation_id}
        
        Por favor, llegue 15 minutos antes de su cita.
        
        Saludos,
        Hospital Management System
        """
        
        await self.email_service.send_mock_email(
            notification.patient_email, 
            patient_subject, 
            patient_body
        )
        
        # Notificación al doctor
        doctor_subject = "Nueva Cita Médica Programada"
        doctor_body = f"""
        Dr./Dra. {notification.doctor_name},
        
        Se ha programado una nueva cita médica:
        
        • Paciente: {notification.patient_name}
        • Fecha: {notification.appointment_date}
        • Hora: {notification.appointment_time}
        • ID de Reserva: {notification.reservation_id}
        
        Saludos,
        Hospital Management System
        """
        
        await self.email_service.send_mock_email(
            notification.doctor_email, 
            doctor_subject, 
            doctor_body
        )
        
        logger.info(f"Notificaciones de creación enviadas para reserva {notification.reservation_id}")
    
    async def _send_reservation_cancelled_notifications(self, notification: NotificationMessage):
        """Envía notificaciones cuando se cancela una reserva"""
        
        # Notificación al paciente
        patient_subject = "Cita Médica Cancelada"
        patient_body = f"""
        Estimado/a {notification.patient_name},
        
        Su cita médica ha sido cancelada:
        
        • Doctor: {notification.doctor_name}
        • Fecha: {notification.appointment_date}
        • Hora: {notification.appointment_time}
        • ID de Reserva: {notification.reservation_id}
        
        Si necesita reprogramar, por favor contacte con nosotros.
        
        Saludos,
        Hospital Management System
        """
        
        await self.email_service.send_mock_email(
            notification.patient_email, 
            patient_subject, 
            patient_body
        )
        
        # Notificación al doctor
        doctor_subject = "Cita Médica Cancelada"
        doctor_body = f"""
        Dr./Dra. {notification.doctor_name},
        
        La siguiente cita médica ha sido cancelada:
        
        • Paciente: {notification.patient_name}
        • Fecha: {notification.appointment_date}
        • Hora: {notification.appointment_time}
        • ID de Reserva: {notification.reservation_id}
        
        Saludos,
        Hospital Management System
        """
        
        await self.email_service.send_mock_email(
            notification.doctor_email, 
            doctor_subject, 
            doctor_body
        )
        
        logger.info(f"Notificaciones de cancelación enviadas para reserva {notification.reservation_id}")

# Instancia global del servicio
notification_service = NotificationService()

def message_callback(ch, method, properties, body):
    """Callback que se ejecuta cuando llega un mensaje a la cola"""
    try:
        message_data = json.loads(body.decode('utf-8'))
        logger.info(f"Mensaje recibido: {message_data}")
        
        # Procesar el mensaje de forma asíncrona
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(notification_service.process_notification(message_data))
        loop.close()
        
        # Confirmar que el mensaje fue procesado
        ch.basic_ack(delivery_tag=method.delivery_tag)
        
    except Exception as e:
        logger.error(f"Error procesando mensaje: {e}")
        # Rechazar el mensaje y no reencolar (dlq si está configurado)
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

def start_consumer():
    """Inicia el consumidor de RabbitMQ"""
    connection = notification_service.get_rabbitmq_connection()
    channel = connection.channel()
    
    # Configurar QoS para procesar un mensaje a la vez
    channel.basic_qos(prefetch_count=1)
    
    # Configurar el consumidor
    channel.basic_consume(
        queue=notification_service.queue_name,
        on_message_callback=message_callback
    )
    
    logger.info("Iniciando consumidor de notificaciones...")
    logger.info("Presiona CTRL+C para salir")
    
    try:
        channel.start_consuming()
    except KeyboardInterrupt:
        logger.info("Deteniendo consumidor...")
        channel.stop_consuming()
        connection.close()

@app.on_event("startup")
async def startup_event():
    """Configura la infraestructura al iniciar la aplicación"""
    logger.info("Iniciando servicio de notificaciones...")
    
    # Configurar la cola
    notification_service.setup_queue()
    
    # Iniciar el consumidor en un hilo separado
    import threading
    consumer_thread = threading.Thread(target=start_consumer, daemon=True)
    consumer_thread.start()
    
    logger.info("Servicio de notificaciones iniciado correctamente")

@app.get("/")
async def root():
    return {"message": "Servicio de Notificaciones activo", "status": "running"}

@app.get("/health")
async def health_check():
    """Endpoint de health check"""
    try:
        # Verificar conexión a RabbitMQ
        connection = notification_service.get_rabbitmq_connection()
        connection.close()
        return {"status": "healthy", "rabbitmq": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

# Para ejecutar directamente el consumidor sin FastAPI
if __name__ == "__main__":
    notification_service.setup_queue()
    start_consumer()