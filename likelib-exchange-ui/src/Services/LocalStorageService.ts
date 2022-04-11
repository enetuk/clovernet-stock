import { CurrentUser } from "../Contexts/UserProvider";
import { Service } from "typedi";

const CURRENT_USER = "CURRENT_USER";

@Service()
export class LocalStorageService {
  private readonly _storage: Storage;

  constructor() {
    this._storage = localStorage;
  }

  public getCurrentUser(): CurrentUser {
    return this._storage.getItem(CURRENT_USER)
      ? JSON.parse(this._storage.getItem(CURRENT_USER) as string)
      : null;
  }

  public setCurrentUser(user: CurrentUser): void {
    this._storage.setItem(CURRENT_USER, JSON.stringify(user));
  }

  public userLogout(): void {
    this._storage.clear();
  }
}
