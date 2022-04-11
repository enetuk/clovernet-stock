import { LimitOrderFields, LimitOrder, Signature } from "@0x/protocol-utils";
import { NULL_ADDRESS, ZERO } from "../src/constants";
import { CHAIN_ID } from "../src/config";

import { BigNumber, hexUtils } from '@0x/utils';
import { getRandomInteger, randomAddress } from '@0x/contracts-test-utils';

const Ripemd160 = require("ripemd160");
const Base58 = require('base-58');

export const TKN1_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
export const TKN2_ADDRESS = '0x6b175474e89094c44da98b954eedeac495271d0f';
export const MOCK_SIGNATURE = { v: 0, r: "0", s: "0", signatureType: 0 } as Signature;

export function randomAddressBase58() {
    const addr = randomAddress();
    const ripemd = new Ripemd160().update(addr).digest();
    const addrBase58 = Base58.encode(ripemd);
    
    // const bufferStr = Buffer.from(Base58.decode(addrBase58).buffer).toString('hex');
    return addrBase58;
    // return '0x' + bufferStr;
}

/**
 * Creates a random unsigned limit order from the provided fields
 */
export function getRandomLimitOrder(fields: Partial<LimitOrderFields> = {}): LimitOrder {
    return new LimitOrder({
        // Default opts
        makerToken: TKN1_ADDRESS,
        takerToken: TKN2_ADDRESS,
        makerAmount: getRandomInteger('100e18', '1000e18'),
        takerAmount: getRandomInteger('100e18', '1000e18'),
        takerTokenFeeAmount: ZERO,
        maker: randomAddressBase58()/*randomAddress()*/,
        taker: NULL_ADDRESS, // NOTE: Open limit orders should allow any taker address
        sender: NULL_ADDRESS, // NOTE: Mesh currently only support NULL address sender
        feeRecipient: NULL_ADDRESS,
        expiry: new BigNumber(2524604400), // Close to infinite
        salt: new BigNumber(hexUtils.random()),
        pool: '0x0',
        chainId: CHAIN_ID,
        verifyingContract: NULL_ADDRESS,
        ...fields,
    });
}
