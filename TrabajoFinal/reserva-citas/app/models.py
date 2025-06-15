from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base
import datetime

class Reserva(Base):
    __tablename__ = "reservas"
    id = Column(Integer, primary_key=True, index=True)
    paciente_id = Column(String, index=True)
    especialidad_id = Column(String, index=True)
    agenda_id = Column(String, index=True)
    fecha = Column(DateTime, default=datetime.datetime.utcnow)