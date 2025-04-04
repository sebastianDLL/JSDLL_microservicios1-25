import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { DetalleFactura } from "./DetalleFactura";

@Entity()
export class Producto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  descripcion: string;

  @Column()
  marca: string;

  @Column()
  stock: number;

  @OneToMany(() => DetalleFactura, detalle => detalle.producto)
  detalles: DetalleFactura[];
}