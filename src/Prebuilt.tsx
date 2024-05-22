import "./styles.css";
import React, { forwardRef, useCallback, useEffect, useRef } from "react";
import {
  DailyProvider,
  useCallFrame,
  useDaily,
  useLocalSessionId,
  useMeetingSessionState,
  useParticipantProperty,
  useParticipantIds,
} from "@daily-co/daily-react";
import { DailyEventObjectParticipant } from "@daily-co/daily-js";

const App = forwardRef((_, ref) => {
  const callObject = useDaily();
  // @ts-check this works?
  window.callObject = callObject;

  useParticipantIds({
    onParticipantJoined: useCallback(
      (participant: DailyEventObjectParticipant) => {
        callObject?.setCustomIntegrations({
          stage: {
            controlledBy: "*",
            label: "Stage",
            location: "sidebar",
            shared: true,
            src: "http://localhost:3000/?isStage=true",
            loading: "eager",
            name: "stage",
          },
        });
        // console.log("Participant joined", { callObject, participant, ref });
        if (ref?.current) {
          const current = ref.current as HTMLDivElement;
          const iframe = current.getElementsByTagName("iframe")[0];
          console.log("iframe.contentWindow", iframe.contentWindow);
          iframe.contentWindow?.postMessage(
            {
              source: "main-app",
              payload: { participant: participant.participant },
            },
            "*"
          );
        }
      },
      [callObject, ref]
    ),
  });

  // @ts-expect-error debugging
  window.callObject = callObject;

  const { data: sessionData } = useMeetingSessionState({
    onError: (err) => console.error("Meeting session error", err),
  });

  const localSessionId = useLocalSessionId();
  const localUserData = useParticipantProperty(localSessionId, "userData");

  const onClick = () => {
    if (ref?.current) {
      const current = ref.current as HTMLDivElement;
      const iframe = current.getElementsByTagName("iframe")[0];
      console.log("iframe.contentWindow", iframe.contentWindow);
      iframe.addEventListener("load", () => {
        iframe.contentWindow.postMessage("LOADED message", "*");
      });
      iframe.contentWindow.postMessage(
        {
          source: "main-app",
          payload: { participant: { session_id: "abc123" } },
        },
        "*"
      );
    }
  };

  return (
    <>
      <p>Local user data: {JSON.stringify(localUserData, undefined, 2)}</p>
      <p>Local session data: {String(sessionData)}</p>
      <button onClick={onClick}>Send message</button>
    </>
  );
});

export const Prebuilt = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleMessage = useCallback((message, data, origin) => {
    console.log("in main-app message", { message, data, origin });
  }, []);

  useEffect(() => {
    const handleEvent = (event) => {
      const { message, data, origin } = event;

      if (origin === "http://localhost:3000") {
        handleMessage(message, data, origin);
      }
    };

    window.addEventListener("message", handleEvent, false);
    return function cleanup() {
      window.removeEventListener("message", handleEvent);
    };
  });

  const callFrame = useCallFrame({
    parentElRef: wrapperRef,
    options: {
      url: "https://hush.daily.co/demo",
      iframeStyle: {
        width: "100%",
        height: "80vh",
      },
      userData: {
        avatar: "https://www.svgrepo.com/show/532036/cloud-rain-alt.svg",
      },
    },
    shouldCreateInstance: useCallback(() => Boolean(wrapperRef.current), []),
  });

  useEffect(() => {
    if (!callFrame) return;
    callFrame?.join().catch((err) => {
      console.error("Error joining call", err);
    });
  }, [callFrame]);
  return (
    <DailyProvider callObject={callFrame}>
      <App ref={wrapperRef} />
      <div ref={wrapperRef} />
    </DailyProvider>
  );
};
