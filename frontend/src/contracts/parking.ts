import { TransactionBlock } from "@iota/iota-sdk/transactions";
import { PACKAGE_ID, LOT_ID } from "../constants/ids";

export const createParkingPaymentTx = (
    spaceId: string,
    hourlyRate: number,
    hours: number
) => {
    const tx = new TransactionBlock();
    const totalPrice = BigInt(hourlyRate * hours);
    const [payment] = tx.splitCoins(tx.gas, [tx.pure(totalPrice)]);

    tx.moveCall({
        target: `${PACKAGE_ID}::parking_rwa::pay_for_parking`,
        arguments: [
            tx.object(LOT_ID),
            tx.object(spaceId),
            tx.pure(BigInt(hours)),
            payment,
        ],
    });

    return tx;
};