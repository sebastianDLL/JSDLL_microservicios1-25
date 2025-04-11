import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

// Interfaz para los detalles de factura (esta será parte de la estructura JSON)
export interface DetalleFactura {
  productoId: number;
  cantidad: number;
  precioUnitario: number;
}

@Entity()
export class Factura {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  fecha: Date;

  @Column()
  clienteId: number;

  // Almacenamos los detalles como un array JSON
  @Column("jsonb", { nullable: false, default: [] })
  detalles: DetalleFactura[];

  // Agregamos un método para calcular el total de la factura
  calcularTotal(): number {
    if (!this.detalles || this.detalles.length === 0) {
      return 0;
    }
    
    return this.detalles.reduce((total, detalle) => {
      return total + (detalle.cantidad * detalle.precioUnitario);
    }, 0);
  }
}