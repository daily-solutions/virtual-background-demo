import "./styles.css";
import { useCallback, useEffect, useRef } from "react";
import {
  DailyProvider,
  ExtendedDailyParticipant,
  useCallFrame,
  useDaily,
  useParticipantCounts,
  useParticipantIds,
  useParticipantProperty,
  usePermissions,
} from "@daily-co/daily-react";
import { DailyEventObjectParticipant } from "@daily-co/daily-js";

const ParticipantRow = ({ sessionId }: { sessionId: string }) => {
  const participantName = useParticipantProperty(sessionId, "user_name");
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const canSendAudio = usePermissions(sessionId).canSendAudio;
  const canSend = typeof canSendAudio === "boolean" ? canSendAudio : false;

  const canSendAudioParticipantIds = useParticipantIds({
    sort: useCallback(
      (a: ExtendedDailyParticipant, b: ExtendedDailyParticipant) => {
        const aLastActive = a.last_active ?? 0;
        const bLastActive = b.last_active ?? 0;

        return aLastActive < bLastActive ? -1 : 1;
      },
      []
    ),
    filter: useCallback((p: ExtendedDailyParticipant) => {
      const canSend = p.permissions.canSend;
      if (typeof canSend === "boolean") return canSend;
      return canSend.has("audio");
    }, []),
    onParticipantUpdated: useCallback((p: DailyEventObjectParticipant) => {
      console.log("Participant updated", p);
    }, []),
  });

  // Change to 15 later
  const isStageFull = canSendAudioParticipantIds.length > 2;

  const callObject = useDaily();
  return (
    <ul>
      <li>{participantName}</li>
      <li>
        {isStageFull ? (
          <p>Stage is full</p>
        ) : (
          <button
            disabled={canSend}
            onClick={() => {
              callObject?.updateParticipant(sessionId, {
                updatePermissions: {
                  canSend: new Set(["audio", "video"]),
                },
              });
            }}
          >
            Allow Audio
          </button>
        )}
      </li>
      <li>
        <button
          disabled={!canSend}
          onClick={() => {
            callObject?.updateParticipant(sessionId, {
              updatePermissions: {
                canSend: new Set(["video"]),
              },
            });
          }}
        >
          Deny Audio
        </button>
      </li>
    </ul>
  );
};

const App = () => {
  const callObject = useDaily();

  // @ts-expect-error debugging
  window.callObject = callObject;

  const allParticipants = useParticipantIds({
    sort: useCallback(
      (a: ExtendedDailyParticipant, b: ExtendedDailyParticipant) => {
        const aLastActive = a.last_active ?? 0;
        const bLastActive = b.last_active ?? 0;

        return aLastActive < bLastActive ? -1 : 1;
      },
      []
    ),
  });

  const participantCount = useParticipantCounts();

  return (
    <ul>
      <li>{participantCount.present} participants</li>
      <button>Raise Hand</button>
      <button>Lower Hand</button>
      {allParticipants.map((participantId) => (
        <ParticipantRow key={participantId} sessionId={participantId} />
      ))}
    </ul>
  );
};

export const Prebuilt = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const callFrame = useCallFrame({
    // @ts-expect-error will be fixed in the next release
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
    callFrame
      ?.join({
        token:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyIjoiZGVtbyIsInAiOnsiY2EiOnRydWV9LCJkIjoiNjgzYjg5ZjQtYjFmZC00Zjk0LWI4NDUtZWYyNjY2ZTNlMjEzIiwiaWF0IjoxNzE2OTgzNzc3fQ.s4_L9chKyALjGk3BmgH76Q8Dy1n5zZJ6NI-VF0dURL8",
      })
      .catch((err) => {
        console.error("Error joining call", err);
      });
  }, [callFrame]);
  return (
    <DailyProvider callObject={callFrame}>
      <div ref={wrapperRef} />
      <App />
    </DailyProvider>
  );
};
