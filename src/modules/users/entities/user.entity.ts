import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: false })
  worldcoinVerified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  worldcoinVerifiedAt: Date | null;
}