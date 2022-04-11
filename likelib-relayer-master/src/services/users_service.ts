import {Connection, Repository} from 'typeorm';

import {randomAddress} from "@0x/contracts-test-utils";
import {BigNumber} from '@0x/utils';
import {TokenEntity, UserBalanceEntity, UserEntity} from "../entities";

export class UsersService {
  private readonly _usersRepository: Repository<UserEntity>;
  private readonly _tokensRepository: Repository<TokenEntity>;
  private readonly _userBalanceRepository: Repository<UserBalanceEntity>;

  constructor(dbConnection: Connection) {
    this._usersRepository = dbConnection.getRepository<UserEntity>(UserEntity);
    this._tokensRepository = dbConnection.getRepository<TokenEntity>(TokenEntity);
    this._userBalanceRepository = dbConnection.getRepository<UserBalanceEntity>(UserBalanceEntity);
  }

  public async loginAsync(login: string, password: string): Promise<UserEntity | undefined> {
    return this._usersRepository.findOne({
      where: {
        login,
        password
      }
    });
  }

  public async registrationAsync(login: string, password: string): Promise<UserEntity> {
    const foundedUser = await this._usersRepository.findOne({
      where: {login}
    });
    if (foundedUser) {
      return foundedUser;
    }

    const address = randomAddress();
    const user = new UserEntity({
      login,
      password,
      address
    });

    const tokens = await this._tokensRepository.find();
    const userBalances: UserBalanceEntity[] = tokens.map(t => {
      const balance: UserBalanceEntity = new UserBalanceEntity();
      balance.userId = address;
      balance.token = t.address;
      balance.tokenBalance = "0";
      return balance;
    });

    const saved = await this._usersRepository.save(user);
    await this._userBalanceRepository.save(userBalances);
    return saved;
  }

  public async updateBalanceAsync(login: string, balance: string, token: string): Promise<UserEntity | undefined> {
    const user = await this._usersRepository.findOne({
      where: {
        login
      }
    });

    if (!user) {
      return undefined;
    }

    const userBalance: UserBalanceEntity = await this._userBalanceRepository.findOneOrFail({
      where: {
        userId: user.address,
        token: token
      }
    });

    userBalance.tokenBalance = balance;
    await this._userBalanceRepository.save(userBalance);

    return user;
  }

  public async getBalanceAsync(address: string): Promise<any> {
    const user = await this._usersRepository.findOneOrFail({
      where: {
        address
      }
    });

    if (!user) {
      return undefined;
    }

    return this._userBalanceRepository.find({where: {userId: user.address}});
  }

  public async getUsersAsync(): Promise<UserEntity[]> {
    return this._usersRepository.find();
  }

  public async findOrCreateUserByAddress(address: string): Promise<UserEntity> {
    let user = await this._usersRepository.findOne({
      where: {
        address
      }
    });

    if (user) return user;

    user = new UserEntity({
      login: address,
      password: address,
      address
    });

    const tokens = await this._tokensRepository.find();
    const userBalances: UserBalanceEntity[] = tokens.map(t => {
      const balance: UserBalanceEntity = new UserBalanceEntity();
      balance.userId = address;
      balance.token = t.address;
      balance.tokenBalance = "0";
      return balance;
    });

    const saved = await this._usersRepository.save(user);
    await this._userBalanceRepository.save(userBalances);
    return saved;
  }
}
