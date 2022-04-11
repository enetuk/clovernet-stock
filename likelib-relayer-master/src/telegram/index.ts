import {DepositBot} from "./deposit";
import {WithdrawBot} from "./withdraw";
import {TestBot} from "./test";

export const depositBot = new DepositBot();
export const withdrawBot = new WithdrawBot();
export const testBot = new TestBot();