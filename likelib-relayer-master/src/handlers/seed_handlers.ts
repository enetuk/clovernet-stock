import {SeedService} from "../services/seed_service";
import * as express from "express";
import {StatusCodes} from "http-status-codes";

export class SeedHandlers {
  private readonly _seedService: SeedService;

  constructor(seedService: SeedService) {
    this._seedService = seedService;
  }

  public async seedDatabase(req: express.Request, res: express.Response) {
    await this._seedService.seedData();
    res.send(StatusCodes.OK).send({"seeded": "ok"});
  }
}
