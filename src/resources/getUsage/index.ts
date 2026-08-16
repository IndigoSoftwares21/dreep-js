import { API_PATH } from "@/constants/api";
import { HTTP_METHOD } from "@/constants/http";
import toNumber from "@/utils/toNumber";
import type { ResourceParams } from "@/types/resource";
import type { Usage } from "@/types/usage";

export type GetUsageParams = ResourceParams;

/**
 * Storage consumed and how many images, files and folders the project holds.
 *
 * @example
 * const { storageBytes, imageCount } = await getUsage({ request });
 */
const getUsage = async ({ request, signal }: GetUsageParams): Promise<Usage> => {
  const usage = await request<Usage>({
    method: HTTP_METHOD.GET,
    path: API_PATH.USAGE,
    signal,
  });

  return { ...usage, storageBytes: toNumber({ value: usage.storageBytes }) };
};

export default getUsage;
