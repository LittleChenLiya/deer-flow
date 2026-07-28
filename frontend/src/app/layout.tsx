import "katex/dist/katex.min.css";
import "streamdown/styles.css";
import "@/styles/globals.css";

import { type Metadata } from "next";

import { ThemeProvider } from "@/components/theme-provider";
import { I18nProvider } from "@/core/i18n/context";
import { detectLocaleServer } from "@/core/i18n/server";
import { detectAppearanceAccentServer } from "@/core/settings/accent-server";
import { DEFAULT_APPEARANCE_ACCENT } from "@/core/settings/local";

export const metadata: Metadata = {
  title: "DeerFlow",
  description: "A LangChain-based framework for building super agents.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await detectLocaleServer();
  const accent = await detectAppearanceAccentServer();
  return (
    <html
      lang={locale}
      {...(accent !== DEFAULT_APPEARANCE_ACCENT
        ? { "data-accent": accent }
        : {})}
      suppressContentEditableWarning
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider attribute="class" enableSystem disableTransitionOnChange>
          <I18nProvider initialLocale={locale}>{children}</I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
