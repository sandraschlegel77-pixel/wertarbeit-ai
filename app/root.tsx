import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import singularityStyles from "./styles/singularity-theme.css?url";
import aetherionStyles from "./styles/aetherion-luxury.css?url";

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://cdn.shopify.com/" />
        <link
          rel="stylesheet"
          href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
        />
        <link rel="stylesheet" href={singularityStyles} />
        <link rel="stylesheet" href={aetherionStyles} />
        <Meta />
        <Links />
      </head>
      <body className="sg-root">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
