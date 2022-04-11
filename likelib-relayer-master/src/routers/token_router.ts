import * as express from 'express';
import * as asyncHandler from "express-async-handler";
import {TokenService} from "../services/token_service";
import {TokenHandlers} from "../handlers/token_handlers";

export function createTokenRouter(tokenService: TokenService): express.Router {
  const router = express.Router();
  const handlers = new TokenHandlers(tokenService);

  router.get('/seed', asyncHandler(handlers.seedTokenPairs.bind(handlers)));
  router.get('/tokens', asyncHandler(handlers.getTokens.bind(handlers)));
  router.get('/token-pairs', asyncHandler(handlers.getTokenPairs.bind(handlers)));
  router.post('/save-token', asyncHandler(handlers.saveToken.bind(handlers)));
  router.post('/token-pair', asyncHandler(handlers.saveTokenPair.bind(handlers)));
  router.delete('/token/:address', asyncHandler(handlers.deleteToken.bind(handlers)));
  router.delete('/token-pair/:id', asyncHandler(handlers.deleteTokenPair.bind(handlers)));

  return router;
}
