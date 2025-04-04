import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from "typeorm";
import { Cliente } from "./Cliente";
import { DetalleFactura } from "./DetalleFactura";

@Entity()
export class Factura {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  fecha: Date;

  @Column()
  clienteId: number;

  @ManyToOne(() => Cliente, cliente => cliente.facturas)
  @JoinColumn({ name: "clienteId" })
  cliente: Cliente;

  @OneToMany(() => DetalleFactura, detalle => detalle.factura, { cascade: true })
  detalles: DetalleFactura[];
}
