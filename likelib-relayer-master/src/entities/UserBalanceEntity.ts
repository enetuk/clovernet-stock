import {Column, Entity, Generated, JoinColumn, ManyToOne, PrimaryColumn} from "typeorm";
import {UserEntity} from "./UserEntity";
import {BigNumber} from "@0x/utils";

@Entity("user_balance")
export class UserBalanceEntity {
  @Generated("uuid")
  @PrimaryColumn({name: "id"})
  public id?: string;

  @Column({name: 'token_balance', type: 'varchar', default: '0'})
  public tokenBalance?: string;

  @Column({name: "token", nullable: false, type: "varchar"})
  public token?: string;

  @Column({name: "user_id", nullable: false, type: "varchar"})
  public userId?: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({name: "user_id"})
  public user?: UserEntity;

  get tokenBalanceBigNumber() {
    return new BigNumber(this.tokenBalance || 0);
  }
}
