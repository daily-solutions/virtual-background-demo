import React, { useCallback, useEffect, useState } from "react";
import Daily, { DailyEventObject, DailyParticipant } from "@daily-co/daily-js";

import {
  useDaily,
  useDevices,
  useDailyEvent,
  useScreenShare,
  DailyVideo,
  useParticipantIds,
  DailyAudio,
  useInputSettings,
  useNetwork,
  useMeetingSessionState,
  useLocalParticipant,
  ExtendedDailyParticipant,
  useLocalSessionId,
  useParticipant,
  useParticipantProperty,
} from "@daily-co/daily-react";

import "./styles.css";

console.info("Daily version: %s", Daily.version());
console.info("Daily supported Browser:");
console.dir(Daily.supportedBrowser());

export default function App() {
  const callObject = useDaily();
  // @ts-expect-error add callObject to window for debugging
  window.callObject = callObject;

  const logEvent = useCallback((evt: DailyEventObject) => {
    console.log("logEvent: " + evt.action, evt);
  }, []);

  const { data = { state: "PRE-SHOW" } } = useMeetingSessionState<{
    state: "PRE-SHOW" | "SHOW-TIME" | "POST-SHOW";
  }>({
    onError: (err) => console.log("--- useMeetingSessioState Error: ", err),
  });

  const allParticipantIds = useParticipantIds({
    onParticipantJoined(ev) {
      logEvent(ev);
      callObject?.updateParticipant(ev.participant.session_id, {
        setSubscribedTracks: { video: true, audio: true },
      });
    },
    onParticipantLeft(ev) {
      logEvent(ev);
    },
    onParticipantUpdated(ev) {
      logEvent(ev);
    },
  });

  const producerParticipantIds = useParticipantIds({
    filter: useCallback((participant: ExtendedDailyParticipant) => {
      return (participant.userData as { role?: string })?.role === "producer";
    }, []),
  });

  const moderatorParticipantIds = useParticipantIds({
    filter: useCallback((participant: ExtendedDailyParticipant) => {
      return (participant.userData as { role?: string })?.role === "moderator";
    }, []),
  });

  const guestParticipantIds = useParticipantIds({
    filter: useCallback((participant: ExtendedDailyParticipant) => {
      return (participant.userData as { role?: string })?.role === "guest";
    }, []),
  });

  const participantParticipantIds = useParticipantIds({
    filter: useCallback((participant: ExtendedDailyParticipant) => {
      return (
        (participant.userData as { role?: string })?.role === "participant"
      );
    }, []),
  });

  const localSessionId = useLocalSessionId();

  const userData = useParticipantProperty(localSessionId, "userData") as {
    role?: string;
  };

  useEffect(() => {
    if (!callObject || callObject.isDestroyed()) return;

    switch (data.state) {
      case "PRE-SHOW":
      case "POST-SHOW":
        console.log("POST-SHOW or PRE-SHOW");

        const subscribeList = [
          ...guestParticipantIds,
          ...moderatorParticipantIds,
          ...producerParticipantIds,
          ...participantParticipantIds,
        ].reduce((participantIds, key) => {
          if (userData?.role === "producer") {
            return participantIds;
          }
          return {
            ...participantIds,
            [key]: {
              setSubscribedTracks: {
                audio:
                  !participantParticipantIds.includes(key) &&
                  userData?.role !== "participant",
                video: true,
                screenVideo: true,
              },
            },
          };
        }, {});

        if (userData?.role === "participant") {
          callObject?.setLocalAudio(false);
        }

        callObject?.updateParticipants(subscribeList);

        break;
      case "SHOW-TIME":
        console.log("SHOW-TIME");
        const showTimeList = allParticipantIds.reduce((participantIds, key) => {
          return {
            ...participantIds,
            [key]: {
              setSubscribedTracks: {
                audio: false,
                video: false,
                screenVideo: false,
              },
            }, // or any default value you want to assign
          };
        }, {});

        callObject?.updateParticipants(showTimeList);
        break;
    }
  }, [data.state, callObject, allParticipantIds, userData?.role]);

  const [inputSettingsUpdated, setInputSettingsUpdated] = useState(false);
  const [enableBlurClicked, setEnableBlurClicked] = useState(false);
  const [enableBackgroundClicked, setEnableBackgroundClicked] = useState(false);

  const network = useNetwork();

  const {
    cameras,
    setCamera,
    microphones,
    setMicrophone,
    speakers,
    setSpeaker,
  } = useDevices();

  const { errorMsg, updateInputSettings } = useInputSettings({
    onError(ev) {
      console.log("Input settings error (daily-react)", ev);
    },
    onInputSettingsUpdated(ev) {
      setInputSettingsUpdated(true);
      console.log("Input settings updated (daily-react)", ev);
    },
  });

  const { startScreenShare, stopScreenShare, screens } = useScreenShare();

  useDailyEvent("participant-joined", logEvent);
  useDailyEvent("joining-meeting", logEvent);
  useDailyEvent("joined-meeting", logEvent);
  // useDailyEvent("participant-updated", logEvent);
  useDailyEvent("track-started", logEvent);
  useDailyEvent("track-stopped", logEvent);
  useDailyEvent("started-camera", logEvent);
  useDailyEvent("input-settings-updated", logEvent);
  useDailyEvent("loading", logEvent);
  useDailyEvent("loaded", logEvent);
  useDailyEvent("load-attempt-failed", logEvent);
  useDailyEvent("receive-settings-updated", logEvent);
  useDailyEvent("left-meeting", logEvent);
  // useDailyEvent("participant-left", logEvent);
  useDailyEvent("network-connection", logEvent);

  // useDailyEvent("network-quality-change", logEvent);
  useDailyEvent("camera-error", logEvent);
  useDailyEvent("error", (evt) => logEvent);

  // Error logging for background effects
  useDailyEvent("input-settings-updated", logEvent);
  useDailyEvent("nonfatal-error", logEvent);

  function enableBlur() {
    if (!callObject || enableBlurClicked) {
      return;
    }

    setEnableBlurClicked(true);
    setEnableBackgroundClicked(false);

    updateInputSettings({
      video: {
        processor: {
          type: "background-blur",
          config: { strength: 0.5 },
        },
      },
    });
  }

  function enableBackground() {
    if (!callObject || enableBackgroundClicked) {
      return;
    }

    setEnableBackgroundClicked(true);
    setEnableBlurClicked(false);

    updateInputSettings({
      video: {
        processor: {
          type: "background-image",
          config: {
            source:
              "https://docs.daily.co/assets/guides-large-meetings-hero.jpeg",
          },
        },
      },
    });
  }

  // Join the room with the generated token
  const joinRoom = () => {
    if (!callObject) {
      return;
    }

    if (!dailyRoomUrl) {
      alert("Please enter a room url (e.g. https://example.daily.co/room)");
    }

    callObject
      .join({
        // Replace with your own room url
        url: dailyRoomUrl,
      })
      .catch((err) => {
        console.error("Error joining room:", err);
      });
    console.log("joined!");
  };

  const startCamera = () => {
    if (!callObject) {
      return;
    }

    callObject.startCamera().then((res) => {
      console.log("startCamera: ", res);
    });
  };

  const load = () => {
    if (!callObject) {
      return;
    }
    callObject.load({
      url: `https://${dailyRoomUrl}`,
    });
  };

  const preAuth = () => {
    if (!callObject) {
      return;
    }
    callObject.preAuth({
      url: `https://${dailyRoomUrl}`,
    });
  };

  // Remove video elements and leave the room
  function leaveRoom() {
    if (!callObject) {
      return;
    }
    callObject.leave().catch((err) => {
      console.error("Error leaving room:", err);
    });
  }

  // change video device
  function handleChangeVideoDevice(ev: React.ChangeEvent<HTMLSelectElement>) {
    console.log("--- changing video device");
    setCamera(ev.target.value);
  }

  // change mic device
  function handleChangeMicDevice(ev: React.ChangeEvent<HTMLSelectElement>) {
    console.log("--- changing mic device");
    setMicrophone(ev.target.value);
  }

  // change speaker device
  function handleChangeSpeakerDevice(ev: React.ChangeEvent<HTMLSelectElement>) {
    console.log("--- changing speaker device");
    setSpeaker(ev?.target?.value);
  }

  const stopCamera = () => {
    if (!callObject) {
      return;
    }
    callObject.setLocalVideo(false);
  };

  const updateCameraOn = () => {
    if (!callObject) {
      return;
    }
    callObject.setLocalVideo(true);
  };

  const currentCamera = cameras.find((c) => c.selected);
  const currentMicrophone = microphones.find((m) => m.selected);
  const currentSpeaker = speakers.find((s) => s.selected);

  const hiddenParticipantCount = callObject?.participantCounts().hidden ?? 0;
  const presentParticipantCount = callObject?.participantCounts().present ?? 0;

  const participantCounts = hiddenParticipantCount + presentParticipantCount;

  const [dailyRoomUrl, setDailyRoomUrl] = useState("https://hush.daily.co/sfu");

  return (
    <>
      <div className="App">
        <br />
        1. Join the call
        <br />
        <input
          type="text"
          value={dailyRoomUrl}
          onChange={(event) => {
            setDailyRoomUrl(event.target.value);
          }}
        />
        <p>
          {dailyRoomUrl
            ? dailyRoomUrl
            : "Please enter a room url (e.g. https://example.daily.co/room)"}
        </p>
        <button onClick={() => load()}>Load</button> <br />
        <button onClick={() => preAuth()}>Preauth</button> <br />
        <button onClick={() => startCamera()}>Start Camera</button> <br />
        <button onClick={() => joinRoom()}>Join call</button> <br />
        <button onClick={() => leaveRoom()}>Leave call</button>
        <button
          onClick={() => {
            callObject?.setMeetingSessionData({ state: "PRE-SHOW" });
          }}
        >
          Pre Show
        </button>
        <button
          onClick={() => {
            callObject?.setMeetingSessionData({ state: "POST-SHOW" });
          }}
        >
          Post Show
        </button>
        <button
          onClick={() => {
            callObject?.setMeetingSessionData({ state: "SHOW-TIME" });
          }}
        >
          Show Time
        </button>
        <button
          onClick={() => {
            callObject?.setUserData({ role: "guest" });
          }}
        >
          Guest Role
        </button>
        <button
          onClick={() => {
            callObject?.setUserData({ role: "producer" });
          }}
        >
          Producer Role
        </button>
        <button
          onClick={() => {
            callObject?.setUserData({ role: "moderator" });
          }}
        >
          Moderator Role
        </button>
        <button
          onClick={() => {
            callObject?.setUserData({ role: "participant" });
          }}
        >
          Participant Role
        </button>
        <br />
        <hr />
        <br />
        2. Select your device <br />
        <select
          id="video-devices"
          value={currentCamera?.device?.deviceId}
          onChange={handleChangeVideoDevice}
        >
          {cameras.map((cam) => (
            <option key={cam.device.deviceId} value={cam.device.deviceId}>
              {cam.device.label}
            </option>
          ))}
        </select>
        <br />
        <select
          id="mic-devices"
          value={currentMicrophone?.device?.deviceId}
          onChange={handleChangeMicDevice}
        >
          {microphones.map((microphone) => (
            <option
              key={microphone.device.deviceId}
              value={microphone.device.deviceId}
            >
              {microphone.device.label}
            </option>
          ))}
        </select>
        <br />
        <select
          id="speaker-devices"
          value={currentSpeaker?.device?.deviceId}
          onChange={handleChangeSpeakerDevice}
        >
          {speakers.map((speakers) => (
            <option
              key={speakers.device.deviceId}
              value={speakers.device.deviceId}
            >
              {speakers.device.label}
            </option>
          ))}
        </select>
        <br />
        <br />
        <button disabled={enableBlurClicked} onClick={() => enableBlur()}>
          Enable Blur
        </button>
        <button
          disabled={enableBackgroundClicked}
          onClick={() => enableBackground()}
        >
          Enable Background
        </button>
        <br />
        <button onClick={() => startScreenShare()}>Start Screen Share</button>
        <button onClick={() => stopScreenShare()}>Stop Screen Share</button>
        <br />
        <button onClick={() => stopCamera()}>Camera Off</button>
        <button onClick={() => updateCameraOn()}>Camera On</button> <br />
        <br />
      </div>
      {allParticipantIds.map((id) => (
        <DailyVideo type="video" key={id} automirror sessionId={id} />
      ))}
      {/* {screens.map((screen) => (
        <DailyVideo
          type="screenVideo"
          key={screen.screenId}
          automirror
          sessionId={screen.session_id}
        />
      ))} */}
      <DailyAudio />
      <div id="meetingState">Meeting State: {callObject?.meetingState()}</div>
      {inputSettingsUpdated && <div>Input settings updated</div>}
      {errorMsg && <div id="errorMsg">{errorMsg}</div>}
      <div id="participantCount">Participant Counts: {participantCounts}</div>
      <div>Network quality: {network.quality}</div>
    </>
  );
}
