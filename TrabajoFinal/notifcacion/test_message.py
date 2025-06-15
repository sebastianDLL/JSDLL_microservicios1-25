import pika
import json
import smtplib
from email.message import EmailMessage
from datetime import datetime

def send_email(subject, body, to_email):
    smtp_server = "smtp.gmail.com"
    smtp_port = 587
    smtp_user = "luigiferca@gmail.com"
    smtp_password = "stvk hfka zdwr vpis"  # Usa una app password

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = smtp_user
    msg["To"] = to_email
    msg.set_content(body)

    try:
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(msg)
        print(f"✅ Correo enviado a: {to_email}")
    except Exception as e:
        print(f"❌ Error enviando correo: {e}")

def send_notification(message_data):
    rabbitmq_url = "amqp://admin:password123@localhost:5672/"
    queue_name = "medical_notifications"
    
    try:
        connection = pika.BlockingConnection(pika.URLParameters(rabbitmq_url))
        channel = connection.channel()
        channel.queue_declare(queue=queue_name, durable=True)
        channel.basic_publish(
            exchange='',
            routing_key=queue_name,
            body=json.dumps(message_data, ensure_ascii=False),
            properties=pika.BasicProperties(delivery_mode=2)
        )
        print(f"✅ Mensaje enviado a RabbitMQ: {message_data}")
        connection.close()
    except Exception as e:
        print(f"❌ Error enviando mensaje a RabbitMQ: {e}")

    subject = "Notificación de reserva médica"
    if message_data["type"] == "reservation_created":
        body = (
            f"Hola {message_data['patient_name']},\n\n"
            f"Su reserva con {message_data['doctor_name']} para el día {message_data['appointment_date']} a las {message_data['appointment_time']} ha sido creada.\n"
            f"ID de reserva: {message_data['reservation_id']}\n\n"
            "Gracias."
        )
    elif message_data["type"] == "reservation_cancelled":
        body = (
            f"Hola {message_data['patient_name']},\n\n"
            f"Su reserva con {message_data['doctor_name']} para el día {message_data['appointment_date']} a las {message_data['appointment_time']} ha sido cancelada.\n"
            f"ID de reserva: {message_data['reservation_id']}\n\n"
            "Gracias."
        )
    else:
        body = "Tiene una nueva notificación médica."

    send_email(subject, body, message_data["patient_email"])

if __name__ == "__main__":
    notification_data = {
        "type": "reservation_created",
        "patient_email": "delgadillocesar732@gmail.com",
        "patient_name": "Juan Pérez",
        "doctor_email": "delgadillocesar732@gmail.com",
        "doctor_name": "Dr. María García",
        "appointment_date": "2025-06-15",
        "appointment_time": "10:30",
        "reservation_id": f"RES-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    }
    send_notification(notification_data)

    cancellation_data = {
        "type": "reservation_cancelled",
        "patient_email": "delgadillocesar732@gmail.com",
        "patient_name": "Juan Pérez",
        "doctor_email": "delgadillocesar732@gmail.com",
        "doctor_name": "Dr. María García",
        "appointment_date": "2025-06-15",
        "appointment_time": "10:30",
        "reservation_id": f"RES-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    }
    send_notification(cancellation_data)