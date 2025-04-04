import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Factura } from "./Factura";

@Entity()
export class Cliente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  ci: string;

  @Column()
  nombres: string;

  @Column()
  apellidos: string;

  @Column()
  sexo: string;

  @OneToMany(() => Factura, factura => factura.cliente)
  facturas: Factura[];
}