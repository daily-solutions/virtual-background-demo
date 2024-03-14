import { useCallback, useRef } from "react";
import { DailyProvider, useCallFrame } from "@daily-co/daily-react";

export const Prebuilt = () => {
  const callRef = useRef(null);
  const callFrame = useCallFrame({
    parentEl: callRef.current,
    options: {
      iframeStyle: {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
      },
    },
    shouldCreateInstance: useCallback(() => Boolean(callRef.current), []),
  });
  return (
    /*
     * Yes, you can pass a callFrame to DailyProvider!
     * Keep in mind that Daily's iframe runs in a separate
     * secure web context, so some data is not available,
     * such as audio and video tracks.
     */
    <DailyProvider callObject={callFrame}>
      <div ref={callRef} />
    </DailyProvider>
  );
};
