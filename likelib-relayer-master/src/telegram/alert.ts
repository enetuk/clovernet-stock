import {ALERT_BOT_TOKEN, ALERTS_CHAT_ID} from "./config";
import {AbstractTelegramBot} from "./bot";

export class AlertBot extends AbstractTelegramBot {
    constructor() {
        super({token: ALERT_BOT_TOKEN});
    }

    public async sendMessage(text: string): Promise<{ success: boolean; data?: any }> {
        return super._sendMessage(ALERTS_CHAT_ID, text, {parseMode: null});
    }
}