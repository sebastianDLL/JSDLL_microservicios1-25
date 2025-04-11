import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

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
}
