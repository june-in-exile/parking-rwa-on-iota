import { useIotaClient, useCurrentAccount } from "@iota/dapp-kit";
import { useQuery } from "@tanstack/react-query";
import { ParkingSpace } from "../types/parking";
import { PACKAGE_ID } from "../constants/ids";

// 從鏈上對象解析停車格數據
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseParkingSpace(obj: any): ParkingSpace | null {
  try {
    const fields = obj.data?.content?.fields;
    if (!fields) return null;

    return {
      id: obj.data.objectId,
      location: fields.location || "",
      hourlyRate: Number(fields.hourly_rate || 0),
      owner: fields.owner || "",
      price: Number(fields.price || 0),
    };
  } catch (error) {
    console.error("解析停車格數據失敗:", error);
    return null;
  }
}

// 獲取所有停車格（從所有用戶中查詢）
export function useAllParkingSpaces() {
  return useQuery({
    queryKey: ["parkingSpaces", "all"],
    queryFn: async (): Promise<ParkingSpace[]> => {
      if (!PACKAGE_ID || PACKAGE_ID.startsWith("0x...")) {
        console.warn("PACKAGE_ID 未設置，返回空列表");
        return [];
      }

      try {
        // 使用 multiGetObjects 或者從事件中獲取所有停車格
        // 由於 IOTA SDK 的限制，這裡先返回空數組，實際應用中需要：
        // 1. 維護一個後端索引服務
        // 2. 或者從合約事件中重建狀態
        // 3. 或者讓用戶輸入停車格 ID 來查詢
        console.warn("需要實作完整的索引服務來查詢所有停車格");
        return [];
      } catch (error) {
        console.error("查詢停車格失敗:", error);
        return [];
      }
    },
    enabled: !PACKAGE_ID.startsWith("0x..."),
    refetchInterval: 10000, // 每 10 秒刷新一次
  });
}

// 獲取用戶擁有的停車格
export function useMyParkingSpaces() {
  const client = useIotaClient();
  const currentAccount = useCurrentAccount();

  return useQuery({
    queryKey: ["parkingSpaces", "my", currentAccount?.address],
    queryFn: async () => {
      if (!currentAccount?.address) {
        return [];
      }

      if (!PACKAGE_ID || PACKAGE_ID.startsWith("0x...")) {
        throw new Error("請先部署合約並更新 PACKAGE_ID");
      }

      // 查詢用戶擁有的所有 ParkingSpace 對象
      const response = await client.getOwnedObjects({
        owner: currentAccount.address,
        filter: {
          StructType: `${PACKAGE_ID}::parking_rwa::ParkingSpace`,
        },
        options: {
          showContent: true,
          showOwner: true,
        },
      });

      const spaces = response.data
        .map((obj) => parseParkingSpace(obj))
        .filter((space): space is ParkingSpace => space !== null);

      return spaces;
    },
    enabled: !!currentAccount?.address && !PACKAGE_ID.startsWith("0x..."),
    refetchInterval: 10000,
  });
}

// 獲取單個停車格詳情
export function useParkingSpace(spaceId: string | undefined) {
  const client = useIotaClient();

  return useQuery({
    queryKey: ["parkingSpace", spaceId],
    queryFn: async () => {
      if (!spaceId) return null;

      const obj = await client.getObject({
        id: spaceId,
        options: {
          showContent: true,
          showOwner: true,
        },
      });

      return parseParkingSpace(obj);
    },
    enabled: !!spaceId,
  });
}

// 獲取可購買的停車格（price > 0）
export function useAvailableForPurchase() {
  const { data: allSpaces, ...rest } = useAllParkingSpaces();

  return {
    data: allSpaces?.filter((space) => space.price > 0) || [],
    ...rest,
  };
}
