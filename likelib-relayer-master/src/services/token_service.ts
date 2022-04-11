import {Connection, Repository} from "typeorm";
import {TokenEntity, TokenPairEntity} from "../entities";
import {TOKENS_SEED_DATA} from "../token_pairs";

export class TokenService {
  private readonly _connection: Connection;
  private readonly _tokenPairRepository: Repository<TokenPairEntity>;
  private readonly _tokensRepository: Repository<TokenEntity>;

  constructor(connection: Connection) {
    this._connection = connection;
    this._tokensRepository = this._connection.manager.getRepository<TokenEntity>(TokenEntity);
    this._tokenPairRepository = this._connection.manager.getRepository<TokenPairEntity>(TokenPairEntity);
  }

  public async seedTokenPairs(): Promise<TokenPairEntity[]> {
    const {tokens, pairs} = TOKENS_SEED_DATA;
    const tokenEntities: TokenEntity[] = tokens.map(token => {
      const entity = new TokenEntity();
      entity.name = token.name;
      entity.symbol = token.symbol;
      entity.address = token.address;
      entity.decimals = token.decimals;
      entity.displayDecimals = token.displayDecimals;
      return entity;
    });

    const tokenPairs: TokenPairEntity[] = pairs.map(pair => {
      const pairEntity = new TokenPairEntity();
      pairEntity.quote = pair.quote;
      pairEntity.base = pair.base;
      return pairEntity;
    });

    await this._tokensRepository.save(tokenEntities);
    return this._tokenPairRepository.save(tokenPairs);
  }

  async getTokenPairs(): Promise<TokenPairEntity[]> {
    return this._tokenPairRepository.find();
  }

  async getTokenPair(base: string, quote: string): Promise<TokenPairEntity | undefined> {
    return this._tokenPairRepository.findOne({
      where: {
        base,
        quote
      }
    })
  }

  async createTokenPair(baseToken: TokenEntity, quoteToken: TokenEntity): Promise<TokenPairEntity> {
    await this._tokensRepository.save([baseToken, quoteToken]);
    const newTokenPair = new TokenPairEntity();
    newTokenPair.base = baseToken.address!;
    newTokenPair.quote = baseToken.address!;

    return this._tokenPairRepository.save(newTokenPair);
  }

  async createTokenPairFromExisted(base: string, quote: string): Promise<TokenPairEntity | undefined> {
    await this._tokensRepository.findOneOrFail({address: base});
    await this._tokensRepository.findOneOrFail({address: quote});
    return this._tokenPairRepository.findOne({where: {base, quote}});
  }

  async deleteTokenPair(id: string): Promise<void> {
    await this._tokenPairRepository.delete({id});
  }

  async getTokens(): Promise<TokenEntity[]> {
    return this._tokensRepository.find();
  }

  async getToken(address: string): Promise<TokenEntity | undefined> {
    return this._tokensRepository.findOne({
      where: {
        address
      }
    })
  }

  async saveToken(token: TokenEntity): Promise<TokenEntity> {
    return this._tokensRepository.save(token);
  }

  async deleteToken(address: string): Promise<void> {
    await this._tokenPairRepository.delete({base: address});
    await this._tokenPairRepository.delete({quote: address});
    await this._tokensRepository.delete({address});
  }
}
