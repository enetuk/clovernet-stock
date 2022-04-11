import * as express from 'express';
import * as asyncHandler from "express-async-handler";
import {SeedHandlers} from "../handlers/seed_handlers";
import {SeedService} from "../services/seed_service";

export function createSeedRouter(seedService: SeedService): express.Router {
  const router = express.Router();
  const handlers = new SeedHandlers(seedService);

  router.get('/', asyncHandler(handlers.seedDatabase.bind(handlers)));

  return router;
}
