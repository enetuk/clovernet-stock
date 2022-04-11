// tslint:disable-next-line:completed-docs
import * as express from 'express';
import * as asyncHandler from 'express-async-handler';

import { UsersHandlers } from '../handlers/users_handlers';
import { UsersService } from '../services/users_service';

// tslint:disable-next-line:completed-docs
export function createUsersRouter(usersService: UsersService): express.Router {
    const router = express.Router();
    const handlers = new UsersHandlers(usersService);
    router.post('/login', asyncHandler(handlers.loginUserAsync.bind(handlers)));
    router.post('/registration', asyncHandler(handlers.registrationUserAsync.bind(handlers)));
    router.post('/update-balance', asyncHandler(handlers.updateBalanceAsync.bind(handlers)));
    router.get('/all', asyncHandler(handlers.getUsersAsync.bind(handlers)));
    router.get('/balance', asyncHandler(handlers.getBalance.bind(handlers)));
    router.post("/update", asyncHandler(handlers.createOrFindUserByAddress.bind(handlers)));

    return router;
}
