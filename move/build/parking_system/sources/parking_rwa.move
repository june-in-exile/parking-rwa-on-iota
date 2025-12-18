module parking_system::parking_rwa {
    use iota::coin::{Self, Coin};
    use iota::iota::IOTA;
    use iota::balance::{Self, Balance};
    use iota::event;
    use iota::object::{Self, UID, ID};
    use iota::tx_context::{Self, TxContext};
    use iota::transfer;
    use std::string::String;

    /// 錯誤代碼
    const EIncorrectAmount: u64 = 0;
    const ENotOwner: u64 = 1;

    /// 停車場營運物件
    struct ParkingLot has key {
        id: UID,
        operator: address,
        commission_rate_bps: u64, // 基點，例如 8000 代表 80%
    }

    /// 停車格物件 (RWA 資產)
    struct ParkingSpace has key, store {
        id: UID,
        location: String,
        hourly_rate: u64,
        owner: address,
    }

    /// 支付事件
    struct PaymentEvent has copy, drop {
        space_id: ID,
        payer: address,
        hours: u64,
        total_amount: u64,
        owner_share: u64,
        operator_share: u64,
    }

    /// 轉讓事件
    struct TransferEvent has copy, drop {
        space_id: ID,
        from: address,
        to: address,
    }

    /// 初始化停車場 (由營運商執行)
    public fun create_lot(ctx: &mut TxContext) {
        let lot = ParkingLot {
            id: object::new(ctx),
            operator: tx_context::sender(ctx),
            commission_rate_bps: 8000, 
        };
        transfer::share_object(lot);
    }

    /// 鑄造停車格並發行
    public fun mint_space(
        location: String, 
        hourly_rate: u64, 
        ctx: &mut TxContext
    ) {
        let space = ParkingSpace {
            id: object::new(ctx),
            location,
            hourly_rate,
            owner: tx_context::sender(ctx),
        };
        transfer::public_transfer(space, tx_context::sender(ctx));
    }

    /// 支付停車費並自動分潤
    public fun pay_for_parking(
        lot: &ParkingLot,
        space: &mut ParkingSpace,
        hours: u64,
        payment: Coin<IOTA>,
        ctx: &mut TxContext
    ) {
        let total_required = space.hourly_rate * hours;
        assert!(coin::value(&payment) == total_required, EIncorrectAmount);

        let total_balance = coin::into_balance(payment);
        let total_value = balance::value(&total_balance);

        // 計算分潤：20% 給車位持有者，80% 給營運商
        let operator_share = (total_value * lot.commission_rate_bps) / 10000;
        let owner_share = total_value - operator_share;

        // 執行轉帳
        let operator_coin = coin::from_balance(balance::split(&mut total_balance, operator_share), ctx);
        let owner_coin = coin::from_balance(total_balance, ctx);

        transfer::public_transfer(operator_coin, lot.operator);
        transfer::public_transfer(owner_coin, space.owner);

        // 發出支付事件
        event::emit(PaymentEvent {
            space_id: object::id(space),
            payer: tx_context::sender(ctx),
            hours,
            total_amount: total_value,
            owner_share,
            operator_share,
        });
    }

    /// 轉讓停車格 (變更收益權持有者)
    public fun transfer_space(space: &mut ParkingSpace, to: address, ctx: &mut TxContext) {
        // 權限檢查：只有當前 owner 可以轉讓
        assert!(space.owner == tx_context::sender(ctx), ENotOwner);

        let from = space.owner;
        space.owner = to;

        // 發出轉讓事件
        event::emit(TransferEvent {
            space_id: object::id(space),
            from,
            to,
        });
    }
}