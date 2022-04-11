import {TEST_BOT_TOKEN, TEST_CHAT_ID} from "./config";
import {AbstractTelegramBot} from "./bot";

export class TestBot extends AbstractTelegramBot {
    constructor() {
        super({token: TEST_BOT_TOKEN});
    }

    async sendMessage(chatId: string, text: string) {
        const {success, data} = await super._sendMessage(TEST_CHAT_ID, text);

        if (!success) {
            await super._sendMessage(TEST_CHAT_ID, JSON.stringify(data));
        }
    }
}