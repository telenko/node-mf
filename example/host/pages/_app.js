import Head from "next/head";
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <script src="http://localhost:3001/remoteEntry.js" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
