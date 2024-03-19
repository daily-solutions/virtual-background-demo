// import { DailyProvider } from "@daily-co/daily-react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// import App from "./App";

import { Prebuilt } from "./Prebuilt";

const container = document.getElementById("root");
const root = createRoot(container!);

root.render(
  <StrictMode>
    <Prebuilt />
    {/* <DailyProvider dailyConfig={{ useDevicePreferenceCookies: true }}>
      <App />
    </DailyProvider> */}
  </StrictMode>
);
