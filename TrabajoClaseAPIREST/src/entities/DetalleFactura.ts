import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Factura } from "./Factura";
import { Producto } from "./Producto";

@Entity()
export class DetalleFactura {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  facturaId: number;

  @Column()
  productoId: number;

  @Column()
  cantidad: number;

  @Column("decimal", { precision: 10, scale: 2 })
  precioUnitario: number;

  @ManyToOne(() => Factura, factura => factura.detalles)
  @JoinColumn({ name: "facturaId" })
  factura: Factura;

  @ManyToOne(() => Producto, producto => producto.detalles)
  @JoinColumn({ name: "productoId" })
  producto: Producto;
}