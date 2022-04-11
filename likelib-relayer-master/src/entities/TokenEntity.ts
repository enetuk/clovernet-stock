import {Column, Entity, OneToMany, PrimaryColumn} from "typeorm";
import {UserBalanceEntity} from "./UserBalanceEntity";
import {TokenPairEntity} from "./TokenPairEntity";

@Entity({ name: "token" })
export class TokenEntity {
  @PrimaryColumn({ name: "address", type: "varchar" })
  public address?: string;

  @Column({ name: 'name', type: 'varchar', nullable: false })
  public name?: string;

  @Column({ name: 'symbol', type: 'varchar', nullable: false })
  public symbol?: string;

  @Column({ name: 'decimals', type: 'int', default: 18 })
  public decimals?: number;

  @Column({ name: "displayDecimals", type: "int", default: 4 })
  public displayDecimals?: number;

  @OneToMany(() => TokenPairEntity, pair => pair.base)
  public base?: TokenPairEntity[];

  @OneToMany(() => TokenPairEntity, pair => pair.quote)
  public quote?: TokenPairEntity[];
}
