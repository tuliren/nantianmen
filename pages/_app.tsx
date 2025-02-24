import PlausibleProvider from 'next-plausible';
import type { AppProps } from 'next/app';
import Head from 'next/head';

import '../styles/globals.css';
import '../styles/tailwind.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  // Uses NEXT_PUBLIC_VERCEL_ENV instead of NODE_ENV so we can exclude previews from analytics collection.
  // see https://vercel.com/docs/concepts/projects/environment-variables#system-environment-variables
  const enableAnalytics = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';

  return (
    <>
      <Head>
        <title>南天门</title>
        <meta name="description" content="南天门小游戏" />
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <PlausibleProvider domain="nantianmen.liren.dev" enabled={enableAnalytics}>
        <Component {...pageProps} />
      </PlausibleProvider>
    </>
  );
}
