import axios from "axios";
import {logger} from "../logger";
import {defaultParseMode} from "./config";
import {removeNullishValues} from "../utils/params_collector_utils";

export interface IAbstractTelegramBotConstructorParams {
    token: string;
}

enum MethodsNames {
    SendMessage = 'sendMessage'
}

export class AbstractTelegramBot {
    protected readonly _token: string;

    constructor(params: IAbstractTelegramBotConstructorParams) {
        const {token} = params;

        this._token = token;
    }


    public _getBotURL() {
        return `https://api.telegram.org/bot${this._token}`;
    }

    protected async _sendMessage(chatId: string, text: string, params?: any): Promise<{ success: boolean, data?: any }> {
        const {
            parseMode = defaultParseMode,
        } = params || {};

        try {
            const sendMessageParams = removeNullishValues({
                chat_id: chatId,
                text,
                parse_mode: parseMode,
            })

            const {data} = await axios.post(`${this._getBotURL()}/${MethodsNames.SendMessage}`, sendMessageParams);

            if (!data.ok) {
                return {
                    success: false,
                    data,
                }
            }
        } catch (error) {
            logger.error(`Error on sendMessage: ${JSON.stringify(error)}`);
            const data = {
                // @ts-ignore
                config: error?.config,
                // @ts-ignore
                response: error?.response.data,
            };

            return {
                success: false,
                data
            }
        }

        return {
            success: true
        }
    }
}