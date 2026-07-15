import { getPayload } from "payload";
import config from "@payload-config";

/** Cached Payload local-API client (getPayload memoizes internally). */
export const getPayloadClient = () => getPayload({ config });

export type AppLocale = "en" | "fr";
