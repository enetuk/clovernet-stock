import { AlertBot } from "./alert";
import {AbstractTelegramBot, IAbstractTelegramBotConstructorParams} from "./bot";
import {TestBot} from "./test";

interface IBaseTelegramBot extends IAbstractTelegramBotConstructorParams {
    /**
     * Перенаправлять ли все сообщения в тестовый чат?
     */
    useTestBot?: boolean;
}

export class BaseTelegramBot extends AbstractTelegramBot {
    private readonly alertBot = new AlertBot();
    private readonly testBot = new TestBot();

    constructor(props: IBaseTelegramBot) {
        super({token: props.token});
        const {useTestBot = process.env.NODE_ENV === 'development'} = props;

        if (useTestBot) {
            this.sendMessage = this.testBot.sendMessage.bind(this.testBot);
        }
    }

    /**
     * Отправляет сообщение в заданный чат
     * Если неуспешно – то отправляет сообщение в чат алертов с ошибкой
     *
     * @param chatId
     * @param text
     */
    async sendMessage(chatId: string, text: string) {
        const {success, data} = await super._sendMessage(chatId, text);

        if (!success) {
            await this.alertBot.sendMessage(JSON.stringify(data));
        }
    }
}