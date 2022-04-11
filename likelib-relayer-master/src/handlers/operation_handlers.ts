import {OperationService} from "../services/operation_service";
import * as express from "express";
import {depositBot, withdrawBot} from "../telegram";
import * as HttpStatus from "http-status-codes";

export class OperationHandlers {
    private readonly _operationService: OperationService;

    constructor(operationService: OperationService) {
        this._operationService = operationService;
    }

    async deposit(req: express.Request, res: express.Response) {
        const {currency, amount, network, internalID} = req.body;

        await depositBot.notify({
            network,
            currency,
            amount,
            internalID,
        });

        res.status(HttpStatus.OK).send();
    }

    async withdraw(req: express.Request, res: express.Response) {
        const {currency, amount, network, internalID, address} = req.body;

        await withdrawBot.notify({
            network,
            currency,
            amount,
            internalID,
            address,
        });

        res.status(HttpStatus.OK).send();
    }
}