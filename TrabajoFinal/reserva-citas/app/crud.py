from sqlalchemy.orm import Session
from . import models, schemas

def crear_reserva(db: Session, reserva: schemas.ReservaCreate):
    db_reserva = models.Reserva(**reserva.dict())
    db.add(db_reserva)
    db.commit()
    db.refresh(db_reserva)
    return db_reserva

def listar_reservas(db: Session):
    return db.query(models.Reserva).all()