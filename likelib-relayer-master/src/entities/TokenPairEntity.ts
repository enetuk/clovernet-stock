import {Column, Entity, Generated, JoinColumn, ManyToOne, PrimaryColumn} from "typeorm";
import {TokenEntity} from "./TokenEntity";

@Entity({name: "token_pair"})
export class TokenPairEntity {
  @Generated("uuid")
  @PrimaryColumn({name: "id"})
  public id?: string;

  @Column({name: "base", nullable: false, type: "varchar"})
  // @ts-ignore
  public base: string;

  @ManyToOne(() => TokenEntity, {eager: true})
  @JoinColumn({name: "base"})
  public baseToken?: TokenEntity;

  @Column({name: "quote", nullable: false, type: "varchar"})
  // @ts-ignore
  public quote: string;

  @ManyToOne(() => TokenEntity, {eager: true})
  @JoinColumn({name: "quote"})
  public quoteToken?: TokenEntity;
}
