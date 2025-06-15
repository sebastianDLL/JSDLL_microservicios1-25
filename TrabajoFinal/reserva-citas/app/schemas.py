from pydantic import BaseModel
from datetime import datetime

class ReservaCreate(BaseModel):
    paciente_id: str
    especialidad_id: str
    agenda_id: str

class ReservaOut(BaseModel):
    id: int
    paciente_id: str
    especialidad_id: str
    agenda_id: str
    fecha: datetime

    class Config:
        orm_mode = True