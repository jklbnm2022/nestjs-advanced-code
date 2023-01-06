import { Exclude } from 'class-transformer';
import { Order } from 'src/order/entites/order.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  password: string;

  @Column({ default: true })
  is_ambassador: boolean;

  @OneToMany(() => Order, (order) => order.user, {
    createForeignKeyConstraints: false,
  })
  orders: Order[];

  get revenue(): number {
    return this.orders
      .filter((o) => o.complete)
      .reduce((s, o) => s + o.ambassador_revenue, 0);
  }

  get name(): string {
    return `${this.first_name} ${this.last_name}`;
  }
}
