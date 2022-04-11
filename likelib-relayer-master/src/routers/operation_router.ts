import * as express from 'express';
import * as asyncHandler from "express-async-handler";
import {OperationService} from "../services/operation_service";
import {OperationHandlers} from "../handlers/operation_handlers";

export function createOperationRouter(operationService: OperationService): express.Router {
    const router = express.Router();
    const handlers = new OperationHandlers(operationService);

    router.post('/deposit', asyncHandler(handlers.deposit.bind(handlers)));
    router.post('/withdraw', asyncHandler(handlers.withdraw.bind(handlers)));


    return router;
}
