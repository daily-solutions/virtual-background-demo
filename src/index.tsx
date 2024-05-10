import { DailyProvider } from "@daily-co/daily-react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";

const container = document.getElementById("root");

if (!container) {
  throw new Error("No root element found");
}

const root = createRoot(container);

root.render(
  <StrictMode>
    <DailyProvider
      subscribeToTracksAutomatically={false}
      dailyConfig={{ useDevicePreferenceCookies: true }}
      sendSettings={{
        video: {
          encodings: {
            low: {
              maxBitrate: 2000 * 1000,
              scaleResolutionDownBy: 1,
              maxFramerate: 30,
            },
          },
        },
      }}
    >
      <App />
    </DailyProvider>
  </StrictMode>
);
