import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const cookieLocale = cookieStore.get("locale")?.value;
  const acceptLanguage = headerStore.get("accept-language");

  let locale = cookieLocale ?? "fr";

  if (!cookieLocale && acceptLanguage) {
    if (acceptLanguage.includes("en")) locale = "en";
    else locale = "fr";
  }

  if (!["fr", "en"].includes(locale)) locale = "fr";

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
