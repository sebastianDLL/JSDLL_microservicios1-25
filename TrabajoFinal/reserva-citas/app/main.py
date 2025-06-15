from fastapi import FastAPI, Depends, HTTPException
from . import models, schemas, crud, database
from .auth import verify_jwt
import requests

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/especialidades")
def obtener_especialidades(user=Depends(verify_jwt)):
    # Solo usuarios autenticados pueden acceder
    resp = requests.post(
        "http://localhost/agenda/graphql",
        json={"query": "{ specialties { id name description } }"}
    )
    return resp.json().get("data", {}).get("specialties", [])

@app.post("/reservar", response_model=schemas.ReservaOut)
def reservar_cita(reserva: schemas.ReservaCreate, db: Session = Depends(database.get_db), user=Depends(verify_jwt)):
    return crud.crear_reserva(db, reserva)

@app.get("/reservas", response_model=list[schemas.ReservaOut])
def listar_reservas(db: Session = Depends(database.get_db), user=Depends(verify_jwt)):
    return crud.listar_reservas(db)