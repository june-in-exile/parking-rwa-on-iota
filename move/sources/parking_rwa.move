module parking_system::parking_rwa {
    use iota::coin::{Self, Coin};
    use iota::iota::IOTA;
    use iota::balance::{Self, Balance};

    /// 錯誤代碼
    const EIncorrectAmount: u64 = 0;

    /// 停車場營運物件
    public struct ParkingLot has key {
        id: UID,
        operator: address,
        commission_rate_bps: u64, // 基點，例如 8000 代表 80%
    }

    /// 停車格物件 (RWA 資產)
    public struct ParkingSpace has key, store {
        id: UID,
        location: String,
        hourly_rate: u64,
        owner: address,
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
        mut payment: Coin<IOTA>,
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
    }

    /// 轉讓停車格 (變更收益權持有者)
    public fun transfer_space(space: &mut ParkingSpace, to: address) {
        space.owner = to;
    }
}