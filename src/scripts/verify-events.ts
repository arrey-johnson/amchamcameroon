import { getPayload } from "payload";
import config from "@payload-config";

const payload = await getPayload({ config });
const res = await payload.find({
  collection: "events",
  limit: 50,
  sort: "-startAt",
  locale: "en",
  depth: 1,
});
const now = Date.now();
for (const e of res.docs) {
  const past = new Date(e.startAt).getTime() < now;
  const cover =
    typeof e.coverImage === "object" && e.coverImage
      ? "yes"
      : e.coverImage
        ? "id"
        : "NONE";
  const gallery = e.gallery?.length ?? 0;
  payload.logger.info(
    `${past ? "PAST" : "UPCOMING"} ${String(e.startAt).slice(0, 10)} [${e.category}] cover=${cover} gallery=${gallery} — ${e.title}`,
  );
}
