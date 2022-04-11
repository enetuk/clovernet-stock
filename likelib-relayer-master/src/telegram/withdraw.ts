import {BaseTelegramBot} from "./base";
import {WITHDRAW_BOT_TOKEN, WITHDRAW_CHAT_ID} from "./config";
import {boldedList} from "../utils/message_composer_utils";

interface WithdrawNotifyParams {
    internalID: string;
    currency: Currency;
    network: Network;
    amount: number;
    address: string;
}
export class WithdrawBot extends BaseTelegramBot {
    _paramsToText: Record<keyof WithdrawNotifyParams, string> = {
        internalID: 'ID',
        amount: 'Amount',
        currency: 'Currency',
        network: 'Network',
        address: 'Address'
    }

    constructor() {
        super({token: WITHDRAW_BOT_TOKEN});
    }

    _composeMessageText(params: WithdrawNotifyParams) {
        return `<b>Withdraw request</b>\n\n${boldedList(params, this._paramsToText)}`;
    }

    async notify(params: WithdrawNotifyParams) {
        await this.sendMessage(WITHDRAW_CHAT_ID, this._composeMessageText(params));
    }
}