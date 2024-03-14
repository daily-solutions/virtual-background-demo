import { useCallback, useEffect, useRef, useState } from "react";
import { DailyProvider, useCallFrame } from "@daily-co/daily-react";

export const Prebuilt = () => {
  const [yolo, setYolo] = useState(false);
  const callRef = useRef(null);
  const callFrame = useCallFrame({
    parentEl: callRef.current,
    options: {
      url: "https://hush.daily.co/sfu",
      iframeStyle: {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
      },
    },
    shouldCreateInstance: useCallback(() => yolo, [yolo]),
  });
  useEffect(() => setYolo(true), []);
  useEffect(() => {
    if (!callFrame) return;
    callFrame?.join();
  }, [callFrame]);
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
