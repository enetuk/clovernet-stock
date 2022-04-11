import {
  OrderbookResponse,
  OrderEventEndState,
  PaginatedCollection,
  SignedLimitOrder,
  SRAOrder,
  SRAOrderMetaData
} from '../types';
import {Connection, In, MoreThanOrEqual, Repository} from 'typeorm';
import {LimitOrder} from '@0x/protocol-utils';

import {DB_ORDERS_UPDATE_CHUNK_SIZE, SRA_ORDER_EXPIRATION_BUFFER_SECONDS} from '../config';
import {NULL_ADDRESS, ONE_SECOND_MS, ZERO} from '../constants';
import {
  DealPriceEntity,
  SignedOrderV4Entity,
  UserEntity,
  UserBalanceEntity,
  TokenEntity,
  TokenPairEntity
} from '../entities';
import {ValidationError, ValidationErrorCodes, ValidationErrorReasons} from '../errors';
import {orderUtils} from '../utils/order_utils';
import {paginationUtils} from '../utils/pagination_utils';
import {BigNumber, hexUtils} from '@0x/utils';
import {getRandomFloat, getRandomInteger, randomAddress} from "@0x/contracts-test-utils";
import {MOCK_SIGNATURE} from "../../test/utils";

interface BalanceDiff {
  baseTokenDiff: BigNumber;
  quoteTokenDiff: BigNumber;
}

export class OrderBookService {
  private readonly _connection: Connection;
  private readonly _signedOrdersRepository: Repository<SignedOrderV4Entity>;
  private readonly _usersRepository: Repository<UserEntity>;
  private readonly _userBalanceRepository: Repository<UserBalanceEntity>;
  private readonly _tokensRepository: Repository<TokenEntity>;
  private readonly _tokenPairRepository: Repository<TokenPairEntity>;
  private readonly _dealPriceRepository: Repository<DealPriceEntity>;

  constructor(connection: Connection) {
    this._connection = connection;
    this._signedOrdersRepository = this._connection.manager.getRepository<SignedOrderV4Entity>(SignedOrderV4Entity);
    this._usersRepository = this._connection.manager.getRepository<UserEntity>(UserEntity);
    this._userBalanceRepository = this._connection.manager.getRepository<UserBalanceEntity>(UserBalanceEntity);
    this._tokensRepository = this._connection.manager.getRepository<TokenEntity>(TokenEntity);
    this._tokenPairRepository = this._connection.manager.getRepository<TokenPairEntity>(TokenPairEntity);
    this._dealPriceRepository = this._connection.manager.getRepository<DealPriceEntity>(DealPriceEntity);
  }

  public async getOrderByHashIfExistsAsync(orderHash: string): Promise<SRAOrder | undefined> {
    const signedOrderEntity = await this._signedOrdersRepository.findOne(orderHash);
    return signedOrderEntity ? orderUtils.deserializeOrderToSRAOrder(signedOrderEntity as Required<SignedOrderV4Entity>) : undefined;
  }

  public async cancelOrderByHashIfExistsAsync(orderHash: string): Promise<void> {
    // TODO: auth checks
    const signedOrderEntity = await this._signedOrdersRepository.findOneOrFail(orderHash);

    if (signedOrderEntity.orderState != OrderEventEndState.Added && signedOrderEntity.orderState != OrderEventEndState.Filled) {
      // TODO: throw exception ?
      return;    
    }

    signedOrderEntity.orderState = OrderEventEndState.Cancelled;    
    const tokenPairEntity = await this.getTokenPair(signedOrderEntity.makerToken, signedOrderEntity.takerToken);
    const isAsk = await this.getOrderSide(signedOrderEntity, tokenPairEntity);

    const remainingTakerAmount = signedOrderEntity.remainingFillableTakerAmount_;
    const price = isAsk ? 
      signedOrderEntity.takerAmount_.div(signedOrderEntity.makerAmount_)
      :
      signedOrderEntity.makerAmount_.div(signedOrderEntity.takerAmount_);

    const remainingMakerAmount = (isAsk ? 
      remainingTakerAmount.div(price)
      :
      remainingTakerAmount.multipliedBy(price)
    ).dp(0);

    const balanceEntity: UserBalanceEntity = await this._userBalanceRepository.findOneOrFail({
      where: {
        userId: signedOrderEntity.maker,
        token: isAsk ? tokenPairEntity.base : tokenPairEntity.quote
      }
    });

    balanceEntity.tokenBalance = balanceEntity.tokenBalanceBigNumber.plus(remainingMakerAmount).toString();

    // TODO: should be atomic
    await this._userBalanceRepository.save(balanceEntity);
    await this._signedOrdersRepository.save(signedOrderEntity);
  }

  // tslint:disable-next-line:prefer-function-over-method
  public async getPaginatedOrderBookAsync(
    page: number,
    perPage: number,
    baseToken: string,
    quoteToken: string,
  ): Promise<OrderbookResponse> {
    // TODO: add filters for removed states
    const orderEntities = await this._signedOrdersRepository.find({
      where: {
        orderState: In([OrderEventEndState.Added, OrderEventEndState.Filled]),
        takerToken: In([baseToken, quoteToken]),
        makerToken: In([baseToken, quoteToken]),
      },
    });

    const bidSignedOrderEntities = orderEntities.filter(
      (o) => o.takerToken === baseToken && o.makerToken === quoteToken,
    );

    const askSignedOrderEntities = orderEntities.filter(
      (o) => o.takerToken === quoteToken && o.makerToken === baseToken,
    );

    const bidApiOrders: SRAOrder[] = (bidSignedOrderEntities as Required<SignedOrderV4Entity>[])
      .map(orderUtils.deserializeOrderToSRAOrder)
      .filter(orderUtils.isFreshOrder)
      .sort((orderA, orderB) => orderUtils.compareBidOrder(orderA.order, orderB.order));

    const askApiOrders: SRAOrder[] = (askSignedOrderEntities as Required<SignedOrderV4Entity>[])
      .map(orderUtils.deserializeOrderToSRAOrder)
      .filter(orderUtils.isFreshOrder)
      .sort((orderA, orderB) => orderUtils.compareAskOrder(orderA.order, orderB.order));

    const paginatedBidApiOrders = paginationUtils.paginate(bidApiOrders, page, perPage);
    const paginatedAskApiOrders = paginationUtils.paginate(askApiOrders, page, perPage);
    return {
      bids: paginatedBidApiOrders,
      asks: paginatedAskApiOrders,
    };
  }

  public async getOrderBookOrders(
    makerToken: string,
    takerToken: string,
    tokenPair: TokenPairEntity
  ): Promise<SignedOrderV4Entity[]> {
    // orders of opposite side
    const orders = await this._signedOrdersRepository.find({
      where: {
        orderState: In([OrderEventEndState.Added, OrderEventEndState.Filled]),
        takerToken: makerToken,
        makerToken: takerToken
      },
    });

    // bid order
    if (tokenPair.base === takerToken && tokenPair.quote === makerToken) {
      return orders.sort((orderA, orderB) => orderUtils.compareAskOrderEntity(orderA, orderB));
    }

    // ask order
    if (tokenPair.base === makerToken && tokenPair.quote === takerToken) {
      return orders.sort((orderA, orderB) => orderUtils.compareBidOrderEntity(orderA, orderB));
    }

    return [];
  }

  // tslint:disable-next-line:prefer-function-over-method
  public async getOrdersAsync(
    page: number,
    perPage: number,
    orderFieldFilters: Partial<SignedOrderV4Entity>,
    additionalFilters: { isUnfillable?: boolean; trader?: string },
  ): Promise<PaginatedCollection<SRAOrder>> {
    // Validation
    if (!orderFieldFilters.maker) {
      throw new ValidationError([
        {
          field: 'maker',
          code: ValidationErrorCodes.RequiredField,
          reason: ValidationErrorReasons.UnfillableRequiresMakerAddress,
        },
      ]);
    }

    // Each array element in `filters` is an OR subclause
    const filters: any = {...orderFieldFilters} ;

    if (additionalFilters.isUnfillable) {
      filters.orderState = In([OrderEventEndState.FullyFilled, OrderEventEndState.Cancelled]);
    } else if (additionalFilters.isUnfillable === false) {
      filters.orderState = In([OrderEventEndState.Added, OrderEventEndState.Filled]);
    }

    if (orderFieldFilters.makerToken || orderFieldFilters.takerToken) {
      filters.makerToken = In([orderFieldFilters.makerToken, orderFieldFilters.takerToken]);
      filters.takerToken = In([orderFieldFilters.makerToken, orderFieldFilters.takerToken]);
    }
    const minExpiryTime = Math.floor(Date.now() / ONE_SECOND_MS) + SRA_ORDER_EXPIRATION_BUFFER_SECONDS;
    filters.expiry = MoreThanOrEqual(minExpiryTime);
    Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);
    const [signedOrderCount, signedOrderEntities] = await Promise.all([
      this._signedOrdersRepository.count({
        where: filters,
      }),
      this._signedOrdersRepository.find({
        where: filters,
        ...paginationUtils.paginateDBFilters(page, perPage),
        order: {
          createdAt: 'DESC'
        },
      }),
    ]);

    const apiOrders = (signedOrderEntities as Required<SignedOrderV4Entity>[]).map(
      orderUtils.deserializeOrderToSRAOrder,
    );

    // TODO: apply these filters
    // Join with persistent orders
    // let persistentOrders: SRAOrder[] = [];
    // let persistentOrdersCount = 0;
    // if (additionalFilters.isUnfillable === true) {
    //     const removedStates = [
    //         OrderEventEndState.Cancelled,
    //         OrderEventEndState.Expired,
    //         OrderEventEndState.FullyFilled,
    //         OrderEventEndState.Invalid,
    //         OrderEventEndState.StoppedWatching,
    //         OrderEventEndState.Unfunded,
    //     ];
    //     const filtersWithoutDuplicateSignedOrders = filters.map((filter) => ({
    //         ...filter,
    //         orderState: In(removedStates),
    //     }));
    //     let persistentOrderEntities = [];
    //     [persistentOrdersCount, persistentOrderEntities] = await Promise.all([
    //         this._connection.manager.count(SignedOrderV4Entity, {
    //             where: filtersWithoutDuplicateSignedOrders,
    //         }),
    //         this._connection.manager.find(SignedOrderV4Entity, {
    //             where: filtersWithoutDuplicateSignedOrders,
    //             ...paginationUtils.paginateDBFilters(page, perPage),
    //             order: {
    //                 hash: 'ASC',
    //             },
    //         }),
    //     ]);
    //     persistentOrders = (persistentOrderEntities as Required<SignedOrderV4Entity>[]).map(
    //         orderUtils.deserializeOrderToSRAOrder,
    //     );
    // }

    // const allOrders = apiOrders.concat(persistentOrders);
    // const total = signedOrderCount + persistentOrdersCount;

    // Paginate
    return paginationUtils.paginateSerialize(apiOrders, signedOrderCount, page, perPage);
  }

  public async addOrderAsync(signedOrder: SignedLimitOrder): Promise<void> {
    const tokenPairEntity: TokenPairEntity = await this.getTokenPair(signedOrder.makerToken, signedOrder.takerToken);
    const isAsk: boolean = await this.getOrderSide(signedOrder, tokenPairEntity!);
    await this.checkAndUpdateBalance(signedOrder.maker, signedOrder.makerAmount, tokenPairEntity, isAsk);
    const newOrder: SignedOrderV4Entity = (await this.addOrdersAsync([signedOrder]))[0];
    await this.recalculateOrders(newOrder, tokenPairEntity, isAsk);
  }

  public async getTokenPair(makerToken: string, takerToken: string): Promise<TokenPairEntity> {
    const tokenPair = await this._tokenPairRepository.findOne({
      where: {
        base: takerToken,
        quote: makerToken
      }
    });
    return tokenPair || this._tokenPairRepository.findOneOrFail({
      where: {
        base: makerToken,
        quote: takerToken
      }
    });
  }

  public async getOrderSide(order: SignedLimitOrder | SignedOrderV4Entity, entity: TokenPairEntity): Promise<boolean> {
    // await this.getTokenPair(order.makerToken, order.takerToken);
    return entity.base === order.makerToken && entity.quote === order.takerToken;
  }

  private async recalculateOrders(newOrder: SignedOrderV4Entity, tokenPair: TokenPairEntity, isAsk: boolean): Promise<void> {
    const orders = await this.getOrderBookOrders(
      newOrder.makerToken as string,
      newOrder.takerToken as string,
      tokenPair
    );

    await this.fillOrder(newOrder, orders, tokenPair, isAsk);
  }

  private async matchOrdersPair(
    askOrder: SignedOrderV4Entity,
    bidOrder: SignedOrderV4Entity,
    isAsk: boolean,
    tokenPair: TokenPairEntity
  ): Promise<[SignedOrderV4Entity, SignedOrderV4Entity, BalanceDiff, DealPriceEntity] | undefined> {
    const askPrice = askOrder.takerAmount_.div(askOrder.makerAmount_);
    const bidPrice = bidOrder.makerAmount_.div(bidOrder.takerAmount_);
    const dealPrice = isAsk ? bidPrice : askPrice;
    let balanceDiff: BalanceDiff;

    if (bidPrice.isLessThan(askPrice)) {
      return undefined;
    }

    if (isAsk) {
      const diff = BigNumber.min(
        askOrder.remainingFillableTakerAmount_,
        bidOrder.remainingFillableTakerAmount_.multipliedBy(dealPrice)
      ).dp(0);

      askOrder.remainingFillableTakerAmount = askOrder.remainingFillableTakerAmount_.minus(diff).toString();
      bidOrder.remainingFillableTakerAmount = bidOrder.remainingFillableTakerAmount_
        .minus(diff.div(dealPrice).dp(0))
        .toString();

      // console.log(askPrice.toString(), dealPrice.toString());
      balanceDiff = {
        // (diff / ask_price) - (diff / deal_price)
        baseTokenDiff: (diff.div(askPrice).minus(diff.div(dealPrice))).dp(0),
        quoteTokenDiff: diff
      };

    } else {
      const diff = BigNumber.min(
        bidOrder.remainingFillableTakerAmount_,
        askOrder.remainingFillableTakerAmount_.div(dealPrice)
      ).dp(0);

      bidOrder.remainingFillableTakerAmount = bidOrder.remainingFillableTakerAmount_.minus(diff).toString();
      askOrder.remainingFillableTakerAmount = askOrder.remainingFillableTakerAmount_
        .minus(diff.multipliedBy(dealPrice).dp(0))
        .toString();

      balanceDiff = {
        baseTokenDiff: diff,
        // diff * (bid_price - deal_price)
        quoteTokenDiff: diff.multipliedBy(bidPrice.minus(dealPrice)).dp(0)
      };
    }

    askOrder.orderState = askOrder.remainingFillableTakerAmount_.eq(ZERO)
      ? OrderEventEndState.FullyFilled : OrderEventEndState.Filled;

    bidOrder.orderState = bidOrder.remainingFillableTakerAmount_.eq(ZERO)
      ? OrderEventEndState.FullyFilled : OrderEventEndState.Filled;

    const tradeSize = isAsk ? balanceDiff.quoteTokenDiff.div(dealPrice) : balanceDiff.baseTokenDiff;

    const dealPriceEntity = new DealPriceEntity({
      tokenPair: tokenPair.id,
      price: dealPrice.toNumber(),
      tradeSize: tradeSize.div(1e18).toNumber()
    });

    return [askOrder, bidOrder, balanceDiff, dealPriceEntity];
  }

  private async changeUserBalance(userId: string,
                                  baseToken: string,
                                  quoteToken: string,
                                  balanceDiff: BalanceDiff): Promise<void> {
    const baseBalance: UserBalanceEntity = await this._userBalanceRepository.findOneOrFail({
        where: {
          userId,
          token: baseToken
        }
      }
    );
    const quoteBalance: UserBalanceEntity = await this._userBalanceRepository.findOneOrFail({
      where: {
        userId,
        token: quoteToken
      }
    });

    baseBalance.tokenBalance = baseBalance.tokenBalanceBigNumber
      .plus(balanceDiff.baseTokenDiff)
      .toString();

    quoteBalance.tokenBalance = quoteBalance.tokenBalanceBigNumber
      .plus(balanceDiff.quoteTokenDiff)
      .toString();

    await this._userBalanceRepository.save([baseBalance, quoteBalance]);
  }

  private async fillOrder(newOrder: SignedOrderV4Entity,
                          oppositeOrders: SignedOrderV4Entity[],
                          tokenPair: TokenPairEntity,
                          isAsk: boolean): Promise<void> {
    const changedOrders: Array<SignedOrderV4Entity> = [];
    const changedBalances: Map<string, BalanceDiff> = new Map();
    const dealPriceArr: DealPriceEntity[] = [];
    let totalBidBalanceDiff: BalanceDiff = {
      baseTokenDiff: ZERO,
      quoteTokenDiff: ZERO
    };

    for (let currentOpositOrder of oppositeOrders) {
      let balanceDiff: BalanceDiff;
      let dealPrice: DealPriceEntity;

      const orderPair = isAsk ?
        await this.matchOrdersPair(newOrder, currentOpositOrder, isAsk, tokenPair)
        :
        await this.matchOrdersPair(currentOpositOrder, newOrder, isAsk, tokenPair);

      if (orderPair) {
        if (isAsk) {
          [newOrder, currentOpositOrder, balanceDiff, dealPrice] = orderPair;
        } else {
          [currentOpositOrder, newOrder, balanceDiff, dealPrice] = orderPair;
        }

        totalBidBalanceDiff.baseTokenDiff = totalBidBalanceDiff.baseTokenDiff.plus(balanceDiff.baseTokenDiff);
        totalBidBalanceDiff.quoteTokenDiff = totalBidBalanceDiff.quoteTokenDiff.plus(balanceDiff.quoteTokenDiff);

        changedOrders.push(currentOpositOrder);
        changedBalances.set(currentOpositOrder.maker!, balanceDiff);
        dealPriceArr.push(dealPrice);
        if (newOrder.orderState == OrderEventEndState.FullyFilled) break;
      } else {
        break;
      }
    }

    // TODO: check balances > 0, instead raise exception
    // TODO: handle exception

    const userEntity: UserEntity = await this._usersRepository.findOneOrFail({
      address: newOrder.maker!
    });

    const baseBalance: UserBalanceEntity = await this._userBalanceRepository.findOneOrFail({
      where: {
        userId: userEntity.address,
        token: tokenPair.base
      }
    })

    const quoteBalance: UserBalanceEntity = await this._userBalanceRepository.findOneOrFail({
      where: {
        userId: userEntity.address,
        token: tokenPair.quote
      }
    });

    baseBalance.tokenBalance = baseBalance.tokenBalanceBigNumber
      .plus(totalBidBalanceDiff.baseTokenDiff)
      .toString();

    quoteBalance.tokenBalance = quoteBalance.tokenBalanceBigNumber
      .plus(totalBidBalanceDiff.quoteTokenDiff)
      .toString();

    await this.changeUserBalance(
      userEntity.address,
      tokenPair.base,
      tokenPair.quote,
      totalBidBalanceDiff
    )

    await Promise.all([...changedBalances.keys()].map(address => {
      const balanceDiff = changedBalances.get(address!)!;
      return this.changeUserBalance(
        address,
        tokenPair.base,
        tokenPair.quote,
        balanceDiff
      )
    }));

    await this.saveOrders([newOrder, ...changedOrders]);
    await this._dealPriceRepository.save(dealPriceArr);
  }

  public async addOrdersAsync(signedOrders: SignedLimitOrder[]): Promise<SignedOrderV4Entity[]> {
    const persistentOrders = signedOrders.map((orderInfo) => {
      const limitOrder = new LimitOrder(orderInfo);
      const orderHash = orderUtils.getOrderHash(limitOrder);
      const metaData: SRAOrderMetaData = {
        orderHash: orderHash,
        remainingFillableTakerAmount: orderInfo.takerAmount,
        state: OrderEventEndState.Added,
      };

      const apiOrder: SRAOrder = {
        order: orderInfo,
        metaData: metaData
      };

      return orderUtils.serializePersistentOrder(apiOrder);
    });
    // MAX SQL variable size is 999. This limit is imposed via Sqlite.
    // The SELECT query is not entirely efficient and pulls in all attributes
    // so we need to leave space for the attributes on the model represented
    // as SQL variables in the "AS" syntax. We leave 99 free for the
    // signedOrders model
    return this._signedOrdersRepository.save(persistentOrders, {chunk: DB_ORDERS_UPDATE_CHUNK_SIZE});
  }

  public async saveOrders(orders: SignedOrderV4Entity[]): Promise<SignedOrderV4Entity[]> {
    return this._signedOrdersRepository.save(orders);
  }

  public async checkAndUpdateBalance(
    address: string,
    makerAmount: BigNumber,
    tokenPairEntity: TokenPairEntity,
    isAsk: boolean): Promise<UserBalanceEntity[]> {

    // TODO: remove this
    const user: UserEntity = await this._usersRepository.findOneOrFail({
      where: {
        address
      }
    });

    const baseBalance: UserBalanceEntity = await this._userBalanceRepository.findOneOrFail({
      where: {
        userId: user.address,
        token: tokenPairEntity.base
      }
    });
    const quoteBalance: UserBalanceEntity = await this._userBalanceRepository.findOneOrFail({
      where: {
        userId: user.address,
        token: tokenPairEntity.quote
      }
    })

    const updatedBalance = isAsk
      ? baseBalance.tokenBalanceBigNumber.minus(makerAmount)
      : quoteBalance.tokenBalanceBigNumber.minus(makerAmount);

    if (updatedBalance.lt(ZERO)) {
      throw new ValidationError([
        {
          field: 'makerAmount',
          code: ValidationErrorCodes.ValueOutOfRange,
          reason: ValidationErrorReasons.UnfillableRequiresMakerAddress,
        },
      ]);
    }

    if (isAsk) {
      baseBalance.tokenBalance = updatedBalance.toString();
    } else {
      quoteBalance.tokenBalance = updatedBalance.toString();
    }

    return this._userBalanceRepository.save([baseBalance, quoteBalance]);
  }

  public async seedDatabase(maker = NULL_ADDRESS, taker = NULL_ADDRESS): Promise<void> {
    const tokenPairs = await this._tokenPairRepository.find();

    for (const pair of tokenPairs) {
      const askOrders: SignedOrderV4Entity[] = [];
      const lastDealPrice = await this._dealPriceRepository.findOne({
        where: {
          tokenPair: pair.id,
        },
        order: {
          time: 'DESC',
        },
      });
      let startPrice = '10', endPrice = '15';
      if (lastDealPrice && lastDealPrice.price) {
        startPrice = (lastDealPrice.price*1.01).toFixed(0);
        endPrice = (lastDealPrice.price*1.1).toFixed(0);
      }

      for (let i = 0; i < 100; i++) {
        const askPrice = getRandomFloat(startPrice, endPrice).dp(4);
        const tradeSize = getRandomInteger('1e17', '100e18');
        const makerAmount = tradeSize.toString();
        const takerAmount = askPrice.multipliedBy(tradeSize).dp(0).toString();

        askOrders.push(new SignedOrderV4Entity({
          hash: pair.id + String(i),
          signature: orderUtils.serializeSignature(MOCK_SIGNATURE),
          makerToken: pair.base,
          takerToken: pair.quote,
          makerAmount: makerAmount,
          remainingFillableTakerAmount: takerAmount,
          takerAmount: takerAmount,
          takerTokenFeeAmount: ZERO.toString(),
          maker: maker,
          taker: taker, // NOTE: Open limit orders should allow any taker address
          sender: NULL_ADDRESS, // NOTE: Mesh currently only support NULL address sender
          feeRecipient: NULL_ADDRESS,
          expiry: new BigNumber(2524604400).toString(), // Close to infinite
          salt: new BigNumber(hexUtils.random()).toString(),
          pool: '0x0',
          verifyingContract: NULL_ADDRESS,
        }))
      }

      await this._signedOrdersRepository.save(askOrders);

      const bidOrders: SignedOrderV4Entity[] = [];

      startPrice = '5';
      endPrice = '10';
      if (lastDealPrice && lastDealPrice.price) {
        startPrice = (lastDealPrice.price*0.9).toFixed(0);
        endPrice = (lastDealPrice.price*0.99).toFixed(0);
      }

      for (let i = 0; i < 100; i++) {
        const bidPrice = getRandomFloat(startPrice, endPrice).dp(4);
        const tradeSize = getRandomInteger('1e17', '100e18');
        const makerAmount = tradeSize.multipliedBy(bidPrice).dp(0).toString();
        const takerAmount = tradeSize.toString();

        bidOrders.push(new SignedOrderV4Entity({
          hash: pair.id + String(i + 1000),
          signature: orderUtils.serializeSignature(MOCK_SIGNATURE),
          makerToken: pair.quote,
          takerToken: pair.base,
          makerAmount: makerAmount,
          remainingFillableTakerAmount: takerAmount,
          takerAmount: takerAmount,
          takerTokenFeeAmount: ZERO.toString(),
          maker: taker,
          taker: maker, // NOTE: Open limit orders should allow any taker address
          sender: NULL_ADDRESS, // NOTE: Mesh currently only support NULL address sender
          feeRecipient: NULL_ADDRESS,
          expiry: new BigNumber(2524604400).toString(), // Close to infinite
          salt: new BigNumber(hexUtils.random()).toString(),
          pool: '0x0',
          verifyingContract: NULL_ADDRESS,
        }));
      }

      await this._signedOrdersRepository.save(bidOrders);
    }
  }
}
