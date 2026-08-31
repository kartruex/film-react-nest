import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Schedule } from './schedule.entity';

@Entity('films')
export class Film {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'float' })
  rating: number;

  @Column({ type: 'varchar' })
  director: string;

  // теги одной строкой через запятую — формат стартовых SQL-данных
  @Column({ type: 'text' })
  tags: string;

  @Column({ type: 'varchar' })
  image: string;

  @Column({ type: 'varchar' })
  cover: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar' })
  about: string;

  @Column({ type: 'varchar' })
  description: string;

  @OneToMany(() => Schedule, (schedule) => schedule.film, {
    cascade: true,
    eager: true,
  })
  schedule: Schedule[];
}
