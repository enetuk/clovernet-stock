import {Column, Entity, OneToMany, PrimaryColumn} from 'typeorm';
import {UserBalanceEntity} from "./UserBalanceEntity";

@Entity('user')
export class UserEntity {
  @PrimaryColumn({name: "address", nullable: false})
  public address: string;

  @Column({name: 'login', type: 'varchar', nullable: false})
  public login: string;

  @Column({name: 'password', type: 'varchar', nullable: false})
  public password: string;

  @OneToMany(() => UserBalanceEntity, balance => balance.user)
  public balances?: UserBalanceEntity[];

  constructor(
    opts: {
      login?: string,
      password?: string,
      address?: string
    } = {}
  ) {
    this.login = opts.login!;
    this.password = opts.password!;
    this.address = opts.address!;
  }
}
