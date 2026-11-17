import images from "../../../public/images/credits.json";
import video from "../../../public/video/credits.json";

/**
 * Every found picture and clip on the site, read from the records written when they were
 * downloaded. None of them show Bay Seven itself: they are pictures of the trade from open collections.
 */
type Raw = { file: string; title: string; creator: string | null; license: string; licenseVersion?: string | null; page: string };

const licence = (r: Raw) => (r.license.toLowerCase() === "public domain" ? "Public domain" : r.license);

export const CREDITS = ([...images, ...video] as unknown as Raw[]).map((r) => ({
  file: r.file.split("/").pop() ?? r.file,
  title: r.title.replace(/\s*\(\d{6,}\)$/, ""),
  creator: r.creator ?? "Unknown",
  licence: licence(r),
  page: r.page,
}));
