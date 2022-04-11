import * as express from 'express';
import * as HttpStatus from 'http-status-codes';

import { UsersService } from '../services/users_service';
import {StatusCodes} from "http-status-codes";

export class UsersHandlers {
    private readonly _usersService: UsersService;
    public static root(_req: express.Request, res: express.Response): void {
        const message = `This is the root of the Users API.`;
        res.status(HttpStatus.OK).send({ message });
    }

    constructor(service: UsersService) {
        this._usersService = service;
    }

    public async loginUserAsync(req: express.Request, res: express.Response): Promise<void> {
        const user = await this._usersService.loginAsync(req.body.login, req.body.password);
        if (user) {
            res.status(StatusCodes.OK).send(user);
        } else {
            res.status(StatusCodes.NOT_FOUND).send({error: 'User not found'});
        }
    }

    public async getBalance(req: express.Request, res: express.Response): Promise<void> {
        const {address} = req.query;
        const user = await this._usersService.getBalanceAsync(address as string);
        res.status(StatusCodes.OK).send(user);
    }

    public async registrationUserAsync(req: express.Request, res: express.Response): Promise<void> {
        const {login, password} = req.body;
        const user = await this._usersService.registrationAsync(login, password);
        res.status(StatusCodes.OK).send(user);
    }

    public async updateBalanceAsync(req: express.Request, res: express.Response): Promise<void> {
        const {login, bitcoinBalance, likelibBalance} = req.body;
        const user = await this._usersService.updateBalanceAsync(login, bitcoinBalance, likelibBalance);
        res.status(StatusCodes.OK).send(user);
    }

    public async getUsersAsync(req: express.Request, res: express.Response): Promise<void> {
        const users = await this._usersService.getUsersAsync();
        res.status(StatusCodes.OK).send(users);
    }

    public async createOrFindUserByAddress(req: express.Request, res: express.Response): Promise<void> {
        const {address} = req.body;
        const user = await this._usersService.findOrCreateUserByAddress(address);
        res.status(StatusCodes.OK).send(user);
    }
}
