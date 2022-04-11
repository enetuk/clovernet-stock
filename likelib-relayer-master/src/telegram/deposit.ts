import {DEPOSIT_BOT_TOKEN, DEPOSIT_CHAT_ID} from "./config";
import {boldedList} from "../utils/message_composer_utils";
import {BaseTelegramBot} from "./base";

interface DepositNotifyParams {
    internalID: string;
    currency: Currency;
    network: Network;
    amount: number;
}
export class DepositBot extends BaseTelegramBot {
    _paramsToText: Record<keyof DepositNotifyParams, string> = {
        internalID: 'ID',
        amount: 'Amount',
        currency: 'Currency',
        network: 'Network',
    }

    constructor() {
        super({token: DEPOSIT_BOT_TOKEN});
    }

    _composeMessageText(params: DepositNotifyParams) {
        return `<b>Deposit request</b>\n\n${boldedList(params, this._paramsToText)}`;
    }

    async notify(params: DepositNotifyParams) {
        await this.sendMessage(DEPOSIT_CHAT_ID, this._composeMessageText(params));
    }
}