import {expect} from "@0x/contracts-test-utils";
import {LimitOrderFields} from '@0x/protocol-utils';
import {BigNumber} from '@0x/utils';
import {Connection, In} from 'typeorm';
import {getDBConnectionAsync} from '../src/db_connection';
import {DealPriceEntity, SignedOrderV4Entity, UserBalanceEntity, UserEntity} from '../src/entities';
import {OrderBookService} from '../src/services/orderbook_service';
import {TokenService} from "../src/services/token_service";
import {OrderEventEndState, SRAOrder, SRAOrderMetaData} from '../src/types';
// import {getBaseToken, getQuoteToken} from "../src/config";
import {getRandomLimitOrder, MOCK_SIGNATURE, randomAddressBase58, TKN1_ADDRESS, TKN2_ADDRESS} from './utils';
import { ZERO } from "../src/constants";
import {orderUtils} from '../src/utils/order_utils';

const CHAIN_ID = 2021;
const TOMORROW = new BigNumber(Date.now() + 24 * 3600); // tslint:disable-line:custom-no-magic-numbers


function newSRAOrderAsync(
  privateKey: string,
  params: Partial<LimitOrderFields>,
  metadata?: Partial<SRAOrderMetaData>,
): SRAOrder {
  const limitOrder = getRandomLimitOrder({
    expiry: TOMORROW,
    chainId: CHAIN_ID,
    ...params,
  });

  return {
    order: {
      ...limitOrder,
      signature: MOCK_SIGNATURE,
    },
    metaData: {
      orderHash: orderUtils.getOrderHash(limitOrder),
      remainingFillableTakerAmount: limitOrder.takerAmount,
      state: undefined,
      ...metadata,
    },
  };
}

function newUserEntity(
  address: string,
): UserEntity {
  return new UserEntity({
    login: address,
    address: address,
    password: address
  });
}

const getOrdersArray = async (orderBookService: OrderBookService,
                              connection: Connection,
                              length: number,
                              makerAmount: BigNumber,
                              takerAmount: BigNumber,
                              makerToken: string,
                              takerToken: string) => {
  const tokenPairEntity = await orderBookService.getTokenPair(makerToken, takerToken);
  const isAsk = (makerToken == tokenPairEntity.base);
  const res = [];
  for (let _ of Array(length)) {
    const apiOrder = newSRAOrderAsync("", {makerAmount, takerAmount, makerToken, takerToken});
    await createUserEntity(connection, apiOrder, isAsk);
    
    await orderBookService.checkAndUpdateBalance(
      apiOrder.order.maker, 
      apiOrder.order.makerAmount, 
      tokenPairEntity, 
      isAsk
    );

    const newOrder: SignedOrderV4Entity = (await orderBookService.addOrdersAsync([apiOrder.order]))[0];
    res.push(newOrder);
  }

  return res;
}

async function createUserEntityLong(connection: Connection, 
                                    maker: string, 
                                    makerToken: string, 
                                    takerToken: string,
                                    makerAmount: string,
                                    isAsk: boolean) {
  const userEntity = newUserEntity(maker);
  
  await connection.getRepository(UserEntity).save(userEntity);

  const baseBalanceEntity = new UserBalanceEntity();
  baseBalanceEntity.userId = userEntity.address;
  baseBalanceEntity.tokenBalance = isAsk ? makerAmount : "0",
  baseBalanceEntity.token = isAsk ? makerToken : takerToken;

  const quoteBalanceEntity = new UserBalanceEntity();
  quoteBalanceEntity.userId = userEntity.address;
  quoteBalanceEntity.tokenBalance = isAsk ? "0" : makerAmount;
  quoteBalanceEntity.token = isAsk ? takerToken : makerToken;
  
  await connection.getRepository(UserBalanceEntity).save([baseBalanceEntity, quoteBalanceEntity]);

  return userEntity;
}

async function createUserEntity(connection: Connection, apiOrder: SRAOrder, isAsk: boolean) {
  return await createUserEntityLong(
    connection,
    apiOrder.order.maker,
    apiOrder.order.makerToken,
    apiOrder.order.takerToken,
    apiOrder.order.makerAmount.toString(),
    isAsk
  );
}

async function getUserBalances(connection: Connection, userAddr: string) {
  const token1Balance: UserBalanceEntity = await connection.manager.findOneOrFail(UserBalanceEntity, {
    where: {
      userId: userAddr,
      token: TKN1_ADDRESS
    }
  });

  const token2Balance: UserBalanceEntity = await connection.manager.findOneOrFail(UserBalanceEntity, {
    where: {
      userId: userAddr,
      token: TKN2_ADDRESS
    }
  });

  return [token1Balance.tokenBalanceBigNumber, token2Balance.tokenBalanceBigNumber];
}

// async function getTotalBalance(connection: Connection, addresses: string[]): Promise<[BigNumber, BigNumber]> {
//   const entities = await connection.getRepository(UserEntity).find(
//     {
//       where: {
//         address: In(addresses)
//       },
//     }
//   );

//   return entities.reduce((acc, entity) => {
//     acc[0] = acc[0].plus(entity.token1Balance_);
//     acc[1] = acc[1].plus(entity.token2Balance_);
//     return acc;
//   }, [ZERO, ZERO])
// }

// const getUsersAsrray = async () => {
//   const orders = await this._connection.manager.find(SignedOrderV4Entity, {
//       where: {
//         orderState: In([OrderEventEndState.Added, OrderEventEndState.Filled]),
//         takerToken: takerToken,
//         makerToken: makerToken
//       },
//   });
// }

describe("test bid order", () => {
  let orderBookService: OrderBookService;
  let privateKey: string;
  let connection: Connection;
  let tokenService: TokenService;

  before(async () => {
    connection = await getDBConnectionAsync();
    orderBookService = new OrderBookService(connection);
    tokenService = new TokenService(connection);

    await tokenService.seedTokenPairs();
  });

  afterEach(async () => {
    await connection.manager.clear(SignedOrderV4Entity);
    // await connection.manager.clear(UserEntity);
    await connection.manager.clear(DealPriceEntity);
  });

  it('should fail when add bid orders with not enough balance', async () => {
    const apiOrder = newSRAOrderAsync(privateKey, {
      makerToken: TKN2_ADDRESS,
      takerToken: TKN1_ADDRESS,
      makerAmount: new BigNumber(10).pow(18).multipliedBy(10),
      takerAmount: new BigNumber(10).pow(18).multipliedBy(10)
    });

    const userEntity = await createUserEntity(connection, apiOrder, false);

    apiOrder.order.makerAmount = apiOrder.order.makerAmount.multipliedBy(2);

    let wasError = false;
    try {
      await orderBookService.addOrderAsync(apiOrder.order);
    } catch(err) {
      wasError = true;
    };

    expect(wasError).eq(true);
  });

  it.skip('should add deal prices history', async () => {
    await getOrdersArray(
      orderBookService,
      connection,
      5,
      new BigNumber(10).pow(18),
      new BigNumber(10).pow(18),
      TKN1_ADDRESS,
      TKN2_ADDRESS
    );

    const apiOrder = newSRAOrderAsync(privateKey, {
      makerToken: TKN2_ADDRESS,
      takerToken: TKN1_ADDRESS,
      makerAmount: new BigNumber(10).pow(18).multipliedBy(10),
      takerAmount: new BigNumber(10).pow(18).multipliedBy(10)
    });

    await createUserEntity(connection, apiOrder, false);

    await orderBookService.addOrderAsync(apiOrder.order);

    // const deals = await connection.manager.find(DealPriceEntity, {
    //   baseToken: TKN1_ADDRESS,
    //   quoteToken: TKN2_ADDRESS,
    // });

    // expect(deals.length).equal(5);
  });

  it('should add bid order that matches with all orders', async () => {
    // ask orders
    await getOrdersArray(
      orderBookService,
      connection,
      5,
      new BigNumber(10).pow(18),
      new BigNumber(10).pow(18),
      TKN1_ADDRESS,
      TKN2_ADDRESS
    );

    const apiOrder = newSRAOrderAsync(privateKey, {
      makerToken: TKN2_ADDRESS,
      takerToken: TKN1_ADDRESS,
      makerAmount: new BigNumber(10).pow(18).multipliedBy(10),
      takerAmount: new BigNumber(10).pow(18).multipliedBy(10)
    });

    const bidUserEntity = await createUserEntity(connection, apiOrder, false);

    await orderBookService.addOrderAsync(apiOrder.order);
    const result = await connection.manager.findOne(SignedOrderV4Entity, {
      makerToken: TKN2_ADDRESS,
      takerToken: TKN1_ADDRESS,
    });

    expect(result?.remainingFillableTakerAmount_.eq(new BigNumber(10).pow(18).multipliedBy(5))).eq(true);
    expect(result?.orderState).eq(OrderEventEndState.Filled);

    const askOrders = await connection.manager.find(SignedOrderV4Entity, {
      makerToken: TKN1_ADDRESS,
      takerToken: TKN2_ADDRESS,
    });

    // all ask orders should be fully filled
    askOrders.forEach((order) => {
      expect(order.remainingFillableTakerAmount).eq("0");
      expect(order.orderState).eq(OrderEventEndState.FullyFilled);
    });
  });

  it('should add bid order that doesnt match', async () => {
    // ask_price == 10
    await getOrdersArray(
      orderBookService,
      connection,
      1,
      new BigNumber(10).pow(18),
      new BigNumber(10).pow(18).multipliedBy(10),
      TKN1_ADDRESS,
      TKN2_ADDRESS
    );

    // bid_price == 1
    const apiOrder = newSRAOrderAsync(privateKey, {
      makerToken: TKN2_ADDRESS,
      takerToken: TKN1_ADDRESS,
      makerAmount: new BigNumber(10).pow(18),
      takerAmount: new BigNumber(10).pow(18)
    });

    const bidUserEntity = await createUserEntity(connection, apiOrder, false);

    await orderBookService.addOrderAsync(apiOrder.order);
    const result = await connection.manager.findOneOrFail(SignedOrderV4Entity, {
      makerToken: TKN2_ADDRESS,
      takerToken: TKN1_ADDRESS,
    });

    expect(result.remainingFillableTakerAmount_.eq(new BigNumber(10).pow(18))).eq(true);
    expect(result?.orderState).eq(OrderEventEndState.Added);
  });

  it('should add bid order that match only one order partially', async () => {
    // ask_price == 1
    const askUsers = (await getOrdersArray(
      orderBookService,
      connection,
      1,
      new BigNumber(2).shiftedBy(18),
      new BigNumber(2).shiftedBy(18),
      TKN1_ADDRESS,
      TKN2_ADDRESS
    )).map(entity => entity.maker!);

    // bid_price = 2
    const apiOrder = newSRAOrderAsync(privateKey, {
      makerToken: TKN2_ADDRESS,
      takerToken: TKN1_ADDRESS,
      makerAmount: new BigNumber(2).shiftedBy(18),
      takerAmount: new BigNumber(1).shiftedBy(18)
    });

    const bidUserEntityBefore = await createUserEntity(connection, apiOrder, false);
    const users = [...askUsers, bidUserEntityBefore.address!];


    await orderBookService.addOrderAsync(apiOrder.order);

    const resultBid = await connection.manager.findOneOrFail(SignedOrderV4Entity, {
      makerToken: TKN2_ADDRESS,
      takerToken: TKN1_ADDRESS,
    });

    expect(resultBid.remainingFillableTakerAmount).eq("0");
    expect(resultBid.orderState).eq(OrderEventEndState.FullyFilled);


    const token1BalanceBid: UserBalanceEntity = await connection.manager.findOneOrFail(UserBalanceEntity, {
      where: {
        userId: bidUserEntityBefore.address!,
        token: TKN1_ADDRESS
      }
    });

    const token2BalanceBid: UserBalanceEntity = await connection.manager.findOneOrFail(UserBalanceEntity, {
      where: {
        userId: bidUserEntityBefore.address!,
        token: TKN1_ADDRESS
      }
    });

    const token1BalanceAsk: UserBalanceEntity = await connection.manager.findOneOrFail(UserBalanceEntity, {
      where: {
        userId: askUsers[0],
        token: TKN1_ADDRESS
      }
    });

    const token2BalanceAsk: UserBalanceEntity = await connection.manager.findOneOrFail(UserBalanceEntity, {
      where: {
        userId: askUsers[0],
        token: TKN2_ADDRESS
      }
    });

    const expectedToken1Balance = new BigNumber(1).shiftedBy(18);
    const expectedToken2Balance = new BigNumber(1).shiftedBy(18);

    expect(token1BalanceBid.tokenBalanceBigNumber.eq(expectedToken1Balance)).eq(true);
    expect(token2BalanceBid.tokenBalanceBigNumber.eq(expectedToken2Balance)).eq(true);
    expect(token1BalanceAsk.tokenBalanceBigNumber.eq(expectedToken1Balance)).eq(true);
    expect(token2BalanceAsk.tokenBalanceBigNumber.eq(expectedToken2Balance)).eq(true);
  });

  it('should add bid order that match many fully', async () => {
    const askUsers = [];

    // ask_price = 1..5
    for (let i = 1; i < 6; i++) {
      const users = (await getOrdersArray(
        orderBookService,
        connection,
        1,
        new BigNumber(1).shiftedBy(18),
        new BigNumber(i).shiftedBy(18),
        TKN1_ADDRESS,
        TKN2_ADDRESS
      )).map(entity => entity.maker!);

      askUsers.push(users[0]);
    };

    // bid_price = 5
    const apiOrder = newSRAOrderAsync(privateKey, {
      makerToken: TKN2_ADDRESS,
      takerToken: TKN1_ADDRESS,
      makerAmount: new BigNumber(15).shiftedBy(18),
      takerAmount: new BigNumber(3).shiftedBy(18)
    });

    const bidUserEntityBefore = await createUserEntity(connection, apiOrder, false);
    await orderBookService.addOrderAsync(apiOrder.order);

    const expectedToken1Balance = new BigNumber(3).shiftedBy(18);
    const expectedToken2Balance = new BigNumber(9).shiftedBy(18);

    const token1BalanceBid: UserBalanceEntity = await connection.manager.findOneOrFail(UserBalanceEntity, {
      where: {
        userId: bidUserEntityBefore.address!,
        token: TKN1_ADDRESS
      }
    });

    const token2BalanceBid: UserBalanceEntity = await connection.manager.findOneOrFail(UserBalanceEntity, {
      where: {
        userId: bidUserEntityBefore.address!,
        token: TKN2_ADDRESS
      }
    });

    const resultBid = await connection.manager.findOneOrFail(SignedOrderV4Entity, {
      makerToken: TKN2_ADDRESS,
      takerToken: TKN1_ADDRESS,
    });

    expect(token1BalanceBid.tokenBalanceBigNumber.eq(expectedToken1Balance)).eq(true);
    expect(token2BalanceBid.tokenBalanceBigNumber.eq(expectedToken2Balance)).eq(true);
    expect(resultBid.orderState).to.equal(OrderEventEndState.FullyFilled);
  });
});

describe("test incoming ask order", async () => {
  let orderBookService: OrderBookService;
  let privateKey: string;
  let connection: Connection;

  before(async () => {
    connection = await getDBConnectionAsync();
    orderBookService = new OrderBookService(connection);
  });

  afterEach(async () => {
    await connection.manager.clear(SignedOrderV4Entity);
    // await connection.manager.clear(UserEntity);
    await connection.manager.clear(DealPriceEntity);
  });

  it('should fail when add bid orders with zero balance', async () => {
    const apiOrder = newSRAOrderAsync(privateKey, {
      makerToken: TKN1_ADDRESS,
      takerToken: TKN2_ADDRESS,
      makerAmount: new BigNumber(10).pow(18).multipliedBy(10),
      takerAmount: new BigNumber(10).pow(18).multipliedBy(10)
    });

    await createUserEntity(connection, apiOrder, true);

    apiOrder.order.makerAmount = apiOrder.order.makerAmount.multipliedBy(2);

    let wasError = false;
    try {
      await orderBookService.addOrderAsync(apiOrder.order);
    } catch(err) {
      wasError = true;
    };

    expect(wasError).eq(true);
  });

  it('should add ask order that matches with all orders', async () => {
    // bid_price = 1
    await getOrdersArray(
      orderBookService,
      connection,
      5,
      new BigNumber(10).pow(18),
      new BigNumber(10).pow(18),
      TKN2_ADDRESS,
      TKN1_ADDRESS
    );

    // ask_price = 1
    const apiOrder = newSRAOrderAsync(privateKey, {
      makerToken: TKN1_ADDRESS,
      takerToken: TKN2_ADDRESS,
      makerAmount: new BigNumber(10).pow(18).multipliedBy(10),
      takerAmount: new BigNumber(10).pow(18).multipliedBy(10)
    });

    const askUserEntityBefore = await createUserEntity(connection, apiOrder, true);

    await orderBookService.addOrderAsync(apiOrder.order);
    const result = await connection.manager.findOneOrFail(SignedOrderV4Entity, {
      makerToken: TKN1_ADDRESS,
      takerToken: TKN2_ADDRESS,
    });

    expect(result?.remainingFillableTakerAmount_.eq(new BigNumber(10).pow(18).multipliedBy(5))).eq(true);
    expect(result?.orderState).eq(OrderEventEndState.Filled);

    const bidOrders = await connection.manager.find(SignedOrderV4Entity, {
      makerToken: TKN2_ADDRESS,
      takerToken: TKN1_ADDRESS,
    });

    // all ask orders should be fully filled
    bidOrders.forEach((order) => {
      expect(order.remainingFillableTakerAmount).eq("0");
      expect(order.orderState).eq(OrderEventEndState.FullyFilled);
    });
  });

  it('should add ask order that matches with nobody', async () => {
    // bid_price = 1
    await getOrdersArray(
      orderBookService,
      connection,
      5,
      new BigNumber(1).shiftedBy(18),
      new BigNumber(1).shiftedBy(18),
      TKN2_ADDRESS,
      TKN1_ADDRESS
    );

    // ask_price = 2
    const apiOrder = newSRAOrderAsync(privateKey, {
      makerToken: TKN1_ADDRESS,
      takerToken: TKN2_ADDRESS,
      makerAmount: new BigNumber(1).shiftedBy(18),
      takerAmount: new BigNumber(2).shiftedBy(18)
    });

    const askUserEntityBefore = await createUserEntity(connection, apiOrder, true);

    await orderBookService.addOrderAsync(apiOrder.order);
    const result = await connection.manager.findOneOrFail(SignedOrderV4Entity, {
      makerToken: TKN1_ADDRESS,
      takerToken: TKN2_ADDRESS,
    });

    expect(result.remainingFillableTakerAmount_.eq(new BigNumber(2).shiftedBy(18))).eq(true);
    expect(result.orderState).eq(OrderEventEndState.Added);
  });

  it('should add ask order that match only one order partially', async () => {
    // bid_price == 2
    const bidUsers = (await getOrdersArray(
      orderBookService,
      connection,
      1,
      new BigNumber(2).shiftedBy(18),
      new BigNumber(1).shiftedBy(18),
      TKN2_ADDRESS,
      TKN1_ADDRESS
    )).map(entity => entity.maker!);

    // ask_price = 1
    const apiOrder = newSRAOrderAsync(privateKey, {
      makerToken: TKN1_ADDRESS,
      takerToken: TKN2_ADDRESS,
      makerAmount: new BigNumber(1).shiftedBy(18),
      takerAmount: new BigNumber(1).shiftedBy(18)
    });

    const askUserEntityBefore = await createUserEntity(connection, apiOrder, true);
    const users = [...bidUsers, askUserEntityBefore.address!];

    await orderBookService.addOrderAsync(apiOrder.order);

    const resultAsk = await connection.manager.findOneOrFail(SignedOrderV4Entity, {
      makerToken: TKN1_ADDRESS,
      takerToken: TKN2_ADDRESS,
    });

    const resultBid = await connection.manager.findOneOrFail(SignedOrderV4Entity, {
      makerToken: TKN2_ADDRESS,
      takerToken: TKN1_ADDRESS,
    });

    expect(resultAsk.remainingFillableTakerAmount).eq("0");
    expect(resultAsk.orderState).eq(OrderEventEndState.FullyFilled);
    expect(resultBid.remainingFillableTakerAmount_.eq(new BigNumber(0.5).shiftedBy(18))).eq(true);
    expect(resultBid.orderState).eq(OrderEventEndState.Filled);

    const tokenBalancesAsk = await getUserBalances(connection, apiOrder.order.maker);
    const tokenBalancesBid = await getUserBalances(connection, bidUsers[0]);

    const expectedTotalToken1Balance = new BigNumber(0.5).shiftedBy(18);
    const expectedTotalToken2Balance = new BigNumber(1).shiftedBy(18);;
    expect(tokenBalancesAsk[0].eq(expectedTotalToken1Balance)).eq(true);
    expect(tokenBalancesAsk[1].eq(expectedTotalToken2Balance)).eq(true);

    const expectedTotalToken1BalanceBid = new BigNumber(0.5).shiftedBy(18);
    const expectedTotalToken2BalanceBid = new BigNumber(1).shiftedBy(18);
    // console.log(entityBid.token1Balance, entityBid.token2Balance);
    expect(tokenBalancesBid[0].eq(expectedTotalToken1BalanceBid)).eq(true);
    expect(tokenBalancesBid[1].eq(expectedTotalToken2BalanceBid)).eq(true);
  });

  it('should add ask order that match many fully', async () => {
    const bidUsers = [];

    // bid_price = 1..5
    for (let i = 1; i < 6; i++) {
      const users = (await getOrdersArray(
        orderBookService,
        connection,
        1,
        new BigNumber(i).shiftedBy(18),
        new BigNumber(1).shiftedBy(18),
        TKN2_ADDRESS,
        TKN1_ADDRESS
      )).map(entity => entity.maker!);

      bidUsers.push(users[0]);
    };

    // ask_price = 1
    const apiOrder = newSRAOrderAsync(privateKey, {
      makerToken: TKN1_ADDRESS,
      takerToken: TKN2_ADDRESS,
      makerAmount: new BigNumber(12).shiftedBy(18),
      takerAmount: new BigNumber(12).shiftedBy(18)
    });

    const askUserEntityBefore = await createUserEntity(connection, apiOrder, true);
    await orderBookService.addOrderAsync(apiOrder.order);

    const expectedToken1Balance = new BigNumber(9).shiftedBy(18);
    const expectedToken2Balance = new BigNumber(12).shiftedBy(18);

    const tokenBalancesAskAfter = await getUserBalances(connection, apiOrder.order.maker);

    const resultAsk = await connection.manager.findOneOrFail(SignedOrderV4Entity, {
      makerToken: TKN1_ADDRESS,
      takerToken: TKN2_ADDRESS,
    });

    expect(tokenBalancesAskAfter[0].eq(expectedToken1Balance)).eq(true);
    expect(tokenBalancesAskAfter[1].eq(expectedToken2Balance)).eq(true);
    expect(resultAsk.orderState).to.equal(OrderEventEndState.FullyFilled);
  });
});

describe("test cancel ask/bid order", async () => {
  let orderBookService: OrderBookService;
  let privateKey: string;
  let connection: Connection;

  before(async () => {
    connection = await getDBConnectionAsync();
    orderBookService = new OrderBookService(connection);
  });

  afterEach(async () => {
    await connection.manager.clear(SignedOrderV4Entity);
    await connection.manager.clear(DealPriceEntity);
  });

  it('should cancel ADDED ask order', async () => {
    // ask_price = 1
    const apiOrder = newSRAOrderAsync(privateKey, {
      makerToken: TKN1_ADDRESS,
      takerToken: TKN2_ADDRESS,
      makerAmount: new BigNumber(12).shiftedBy(18),
      takerAmount: new BigNumber(12).shiftedBy(18)
    });

    const askUserEntityBefore = await createUserEntity(connection, apiOrder, true);
    await orderBookService.addOrderAsync(apiOrder.order);

    await orderBookService.cancelOrderByHashIfExistsAsync(apiOrder.metaData.orderHash);
    const balances = await getUserBalances(connection, apiOrder.order.maker);
    
    const orderAfter = await connection.getRepository(SignedOrderV4Entity).findOneOrFail(apiOrder.metaData.orderHash);
    
    expect(orderAfter.orderState).to.equal(OrderEventEndState.Cancelled);
    expect(balances[0].eq(apiOrder.order.makerAmount)).eq(true);
  });

  it('should cancel FILLED ask order', async () => {
    // bid_price = 1
    await getOrdersArray(
      orderBookService,
      connection,
      1,
      new BigNumber(5).shiftedBy(18),
      new BigNumber(5).shiftedBy(18),
      TKN2_ADDRESS,
      TKN1_ADDRESS
    );

    // ask_price = 1
    const apiOrder = newSRAOrderAsync(privateKey, {
      makerToken: TKN1_ADDRESS,
      takerToken: TKN2_ADDRESS,
      makerAmount: new BigNumber(10).shiftedBy(18),
      takerAmount: new BigNumber(10).shiftedBy(18)
    });

    const askUserEntityBefore = await createUserEntity(connection, apiOrder, true);
    await orderBookService.addOrderAsync(apiOrder.order);

    await orderBookService.cancelOrderByHashIfExistsAsync(apiOrder.metaData.orderHash);
    const balances = await getUserBalances(connection, apiOrder.order.maker);
    
    const expectedMakerBalance = new BigNumber(5).shiftedBy(18);
    expect(balances[0].eq(expectedMakerBalance)).eq(true);
  });

  it('should cancel ADDED bid order', async () => {
    // bid_price = 1
    const apiOrder = newSRAOrderAsync(privateKey, {
      makerToken: TKN2_ADDRESS,
      takerToken: TKN1_ADDRESS,
      makerAmount: new BigNumber(12).shiftedBy(18),
      takerAmount: new BigNumber(12).shiftedBy(18)
    });

    const askUserEntityBefore = await createUserEntity(connection, apiOrder, false);
    await orderBookService.addOrderAsync(apiOrder.order);

    await orderBookService.cancelOrderByHashIfExistsAsync(apiOrder.metaData.orderHash);
    const balances = await getUserBalances(connection, apiOrder.order.maker);

    expect(balances[1].eq(apiOrder.order.makerAmount)).eq(true);
  });

  it('should cancel FILLED bid order', async () => {
    // ask_price = 1
    await getOrdersArray(
      orderBookService,
      connection,
      1,
      new BigNumber(5).shiftedBy(18),
      new BigNumber(5).shiftedBy(18),
      TKN1_ADDRESS,
      TKN2_ADDRESS
    );

    // bid_price = 1
    const apiOrder = newSRAOrderAsync(privateKey, {
      makerToken: TKN2_ADDRESS,
      takerToken: TKN1_ADDRESS,
      makerAmount: new BigNumber(10).shiftedBy(18),
      takerAmount: new BigNumber(10).shiftedBy(18)
    });

    const askUserEntityBefore = await createUserEntity(connection, apiOrder, true);
    await orderBookService.addOrderAsync(apiOrder.order);

    await orderBookService.cancelOrderByHashIfExistsAsync(apiOrder.metaData.orderHash);
    const balances = await getUserBalances(connection, apiOrder.order.maker);
    
    const expectedMakerBalance = new BigNumber(5).shiftedBy(18);
    expect(balances[1].eq(expectedMakerBalance)).eq(true);
  });
});


describe("getOrdersAsync", async () => {
  let orderBookService: OrderBookService;
  let privateKey: string;
  let connection: Connection;

  before(async () => {
    connection = await getDBConnectionAsync();
    orderBookService = new OrderBookService(connection);
  });

  afterEach(async () => {
    await connection.manager.clear(SignedOrderV4Entity);
    // await connection.manager.clear(UserEntity);
    // await connection.manager.clear(DealPriceEntity);
  });

  it('should return active orders with isUnfillable=true', async () => {
    const orderFieldFilters = {
      maker: randomAddressBase58(),
      makerToken: TKN1_ADDRESS,
      takerToken: TKN2_ADDRESS
    };

    const ordersAdded = [...Array(5).keys()].map((i: number) => {
      const metaData = {
        state: OrderEventEndState.Added
      };
      return newSRAOrderAsync("", orderFieldFilters, metaData);
    });

    const ordersFilled = [...Array(5).keys()].map((i: number) => {
      const metaData = {
        state: OrderEventEndState.Filled
      };
      return newSRAOrderAsync("", orderFieldFilters, metaData);
    });

    const ordersFullyFilled = [...Array(5).keys()].map((i: number) => {
      const metaData = {
        state: OrderEventEndState.FullyFilled
      };
      return newSRAOrderAsync("", orderFieldFilters, metaData);
    });

    const ordersCanceled = [...Array(5).keys()].map((i: number) => {
      const metaData = {
        state: OrderEventEndState.Cancelled
      };
      return newSRAOrderAsync("", orderFieldFilters, metaData);
    });

    const orders = [...ordersAdded, ...ordersFilled, ...ordersCanceled, ...ordersFullyFilled]
      .map(orderUtils.serializePersistentOrder);

    await connection.getRepository(SignedOrderV4Entity).save(orders);

    const result1 = await orderBookService.getOrdersAsync(1, 5, orderFieldFilters, {isUnfillable: false});
    expect(result1.total).to.equal(10);
    expect(result1.records.length).to.equal(5);

    const result2 = await orderBookService.getOrdersAsync(2, 5, orderFieldFilters, {isUnfillable: false});
    expect(result2.total).to.equal(10);
    expect(result2.records.length).to.equal(5);
  });
});

// describe("seed database", async () => {
//   it('seed database', async () => {
//     const connection = await getDBConnectionAsync();
//     const orderBookService = new OrderBookService(connection);

//     await orderBookService.seedDatabase();

//     const orderbook = await orderBookService.getPaginatedOrderBookAsync(1, 100, TKN1_ADDRESS, TKN2_ADDRESS);

//     for (const bidOrder of orderbook.bids.records) {
//       const price = bidOrder.order.makerAmount.div(bidOrder.order.takerAmount);
//     }

//     await connection.manager.clear(SignedOrderV4Entity);
//   });
// });
