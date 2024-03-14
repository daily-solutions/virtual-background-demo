import "./styles.css";
import React, { useCallback, useEffect, useRef } from "react";
import {
  DailyProvider,
  useCallFrame,
  useDaily,
  useLocalSessionId,
  useMeetingSessionState,
  useParticipantProperty,
  useAppMessage,
  useParticipantIds,
} from "@daily-co/daily-react";
import { DailyEventObjectParticipant } from "@daily-co/daily-js";

const App = () => {
  const callObject = useDaily();

  // You can now call
  // callObject?.updateParticipant()

  const sendAppMessage = useAppMessage({
    onAppMessage: useCallback(
      (msg: any) => console.log("App message", msg),
      []
    ),
  });

  useParticipantIds({
    onParticipantJoined: useCallback(
      (participantId: DailyEventObjectParticipant) => {
        console.log("Participant joined", { callObject, participantId });
        callObject?.setCustomIntegrations({
          stage: {
            controlledBy: "*",
            label: "Stage",
            location: "sidebar",
            shared: true,
            src: "/?isStage=true",
          },
        });
      },
      []
    ),
  });

  // @ts-expect-error debugging
  window.callObject = callObject;

  const { data: sessionData } = useMeetingSessionState({
    onError: (err) => console.error("Meeting session error", err),
  });

  const localSessionId = useLocalSessionId();
  const localUserData = useParticipantProperty(localSessionId, "userData");

  return (
    <>
      <p>Local user data: {JSON.stringify(localUserData, undefined, 2)}</p>
      <p>Local session data: {String(sessionData)}</p>
    </>
  );
};

export const Prebuilt = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);

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
    callFrame?.join();
  }, [callFrame]);
  return (
    <DailyProvider callObject={callFrame}>
      <App />
      <div ref={wrapperRef} />
    </DailyProvider>
  );
};
