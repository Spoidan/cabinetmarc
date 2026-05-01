"use client";

import NextTopLoader from "nextjs-toploader";

export function NavigationProgress() {
  return (
    <NextTopLoader
      color="#1d4ed8"
      height={3}
      showSpinner={false}
      shadow={false}
    />
  );
}
