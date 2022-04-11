import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity('price')
export class DealPriceEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({name: "token_pair_id"})
  public tokenPair?: string;

  @Column({name: 'price', type: 'numeric', nullable: false})
  public price?: number;

  @Column({type: 'timestamptz', default: () => 'now()'})
  public time?: Date;

  @Column({name: 'trade_size', type: 'numeric', nullable: false})
  public tradeSize?: number;

  // @Column({ name: 'state', type: 'enum', enum: OrderSide })
  // public orderSide?: OrderSide;

  constructor(
    opts: {
      tokenPair?: string,
      price?: number,
      tradeSize?: number,
      time?: Date
      // orderSide?: OrderSide
    } = {}
  ) {
    this.tokenPair = opts.tokenPair;
    this.price = opts.price;
    this.tradeSize = opts.tradeSize;
    this.time = opts.time;
  }
}
