import {TokenService} from "../services/token_service";
import * as express from "express";
import {StatusCodes} from "http-status-codes";
import {TokenEntity} from "../entities";

export class TokenHandlers {
  private readonly _tokenService: TokenService;

  constructor(service: TokenService) {
    this._tokenService = service;
  }

  public async seedTokenPairs(req: express.Request, res: express.Response) {
    const result = await this._tokenService.seedTokenPairs();
    res.status(StatusCodes.OK).send(result);
  }

  //create token pairs from existed
  public async saveTokenPair(req: express.Request, res: express.Response): Promise<void> {
    const {base, quote} = req.body;
    const tokenPair = await this._tokenService.createTokenPairFromExisted(base, quote);
    res.status(StatusCodes.OK).send(tokenPair);
  }

  public async getTokenPairs(req: express.Request, res: express.Response): Promise<void> {
    const tokenPairs = await this._tokenService.getTokenPairs();
    res.status(StatusCodes.OK).send(tokenPairs);
  }

  public async deleteTokenPair(req: express.Request, res: express.Response): Promise<void> {
    const id = req.params.id;
    await this._tokenService.deleteTokenPair(id);
    res.status(StatusCodes.OK).send(id)
  }


  public async saveToken(req: express.Request, res: express.Response): Promise<void> {
    const token: TokenEntity = await this._tokenService.saveToken(
      Object.assign(new TokenEntity(), req.body)
    );
    res.status(StatusCodes.OK).send(token);
  }

  public async deleteToken(req: express.Request, res: express.Response): Promise<void> {
    const address = req.params.address;
    await this._tokenService.deleteToken(address);
    res.status(StatusCodes.OK).send(address)
  }

  public async getTokens(req: express.Request, res: express.Response): Promise<void> {
    const tokens = await this._tokenService.getTokens();
    res.status(StatusCodes.OK).send(tokens);
  }
}

