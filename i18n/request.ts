import { getRequestConfig } from "next-intl/server";

// French is the default and only exposed locale for now. English strings are
// scaffolded in messages/en.json for future activation but never rendered.
const DEFAULT_LOCALE = "fr" as const;

export default getRequestConfig(async () => {
  return {
    locale: DEFAULT_LOCALE,
    messages: (await import(`../messages/${DEFAULT_LOCALE}.json`)).default,
  };
});
