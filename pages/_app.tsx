import '../styles/globals.css'
import type {AppContext, AppProps} from 'next/app'
import {withUrqlClient} from "next-urql";
import {cacheExchange, dedupExchange, fetchExchange, ssrExchange} from "urql";
import {FC} from "react";
import App from "next/app";

declare global {
  interface Window {
    __URQL_DATA__?: any
  }
}

interface InitialExampleProps {
  authenticated: boolean;
}

type ExampleAppProps = AppProps & InitialExampleProps;

const MyApp: FC<ExampleAppProps> = ({ Component, pageProps }) => <Component {...pageProps} />;

const isServerSide = typeof window === "undefined";

const ssr = ssrExchange({
  isClient: !isServerSide,
  initialState: !isServerSide ? window.__URQL_DATA__ : undefined,
});

const UrqlWrappedApp = withUrqlClient(() => ({
  exchanges: [
    dedupExchange,
    cacheExchange,
    ssr,
    fetchExchange,
  ],
  url: 'https://example.com',
  fetchOptions: {
    credentials: "include",
  },
}))(MyApp);

UrqlWrappedApp.getInitialProps = async (
  context: AppContext
): Promise<Partial<ExampleAppProps>> => {
  const appProps = App.getInitialProps(context);
  const authenticated = Math.random() > 0.5;
  console.log("Authenticated", authenticated);
  return { ...appProps, authenticated };
};

export default UrqlWrappedApp;
