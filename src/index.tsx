// import { DailyProvider } from "@daily-co/daily-react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// import App from "./App";

import { Prebuilt } from "./Prebuilt";
import { Stage } from "./Stage";

const container = document.getElementById("root");

if (!container) {
  throw new Error("No root element found");
}

const root = createRoot(container);

// Get the value from the url
const urlParams = new URLSearchParams(window.location.search);
const isStage = urlParams.get("isStage");

root.render(
  <StrictMode>
    {isStage ? <Stage /> : <Prebuilt />}
    {/* <DailyProvider
      subscribeToTracksAutomatically={false}
      dailyConfig={{ useDevicePreferenceCookies: true }}
    >
      <App />
    </DailyProvider> */}
  </StrictMode>
);
