import { DailyProvider } from "@daily-co/daily-react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(
  <StrictMode>
    <DailyProvider
      dailyConfig={{ useDevicePreferenceCookies: true }}
      sendSettings={{
        video: {
          maxQuality: "medium",
          encodings: {
            low: {
              maxBitrate: 200000,
              scaleResolutionDownBy: 4,
              maxFramerate: 30,
            },
            medium: {
              maxBitrate: 1200000,
              scaleResolutionDownBy: 1.333,
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
