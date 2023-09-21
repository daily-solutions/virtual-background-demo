import React, { useCallback, useState } from "react";
import Daily, {
  DailyEventObject,
  DailyEventObjectCameraError,
  DailyEventObjectInputSettingsUpdated,
  DailyEventObjectNonFatalError,
  DailyEventObjectParticipant,
  DailyEventObjectParticipants,
} from "@daily-co/daily-js";

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
  const participantIds = useParticipantIds();

  const queryParams = new URLSearchParams(window.location.search);
  const room = queryParams.get("room");

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

  const currentCamera = cameras.find((c) => c.selected);
  const currentMicrophone = microphones.find((m) => m.selected);
  const currentSpeaker = speakers.find((s) => s.selected);

  useDailyEvent("camera-error", (evt: DailyEventObjectCameraError) => {
    console.log(evt);
  });

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

    console.log(room);

    callObject
      .join({
        // Replace with your own room url
        url: `https://${room}`,
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
      url: `https://${room}`,
    });
  };

  const preAuth = () => {
    if (!callObject) {
      return;
    }
    callObject.preAuth({
      url: `https://${room}`,
    });
  };

  // handle events
  const startedCamera = () => {
    console.log("started camera");
  };

  const meetingJoined = (evt: DailyEventObjectParticipants) => {
    console.log("You joined the meeting: ", evt);
  };

  const participantJoined = (evt: DailyEventObjectParticipant) => {
    if (!callObject) return;

    console.log("Participant joined meeting: ", evt);
    // callObject.updateParticipant(evt.participant.session_id, {
    //   setSubscribedTracks: { audio: true, video: true, screenVideo: false },
    // });
  };

  const updateParticipant = (evt: DailyEventObjectParticipant) => {
    console.log("Participant updated: ", evt);
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
    console.log("!!! changing video device");
    setCamera(ev.target.value);
  }

  // change mic device
  function handleChangeMicDevice(ev: React.ChangeEvent<HTMLSelectElement>) {
    console.log("!!! changing mic device");
    setMicrophone(ev.target.value);
  }

  // change speaker device
  function handleChangeSpeakerDevice(ev: React.ChangeEvent<HTMLSelectElement>) {
    console.log("!!! changing speaker device");
    setSpeaker(ev?.target?.value);
  }

  function getInputDevices() {
    if (!callObject) {
      return;
    }
    callObject.getInputDevices().then((inputDevices) => {
      console.log("List of devices:", inputDevices);
    });
  }

  function stopCamera() {
    if (!callObject) {
      return;
    }
    callObject.setLocalVideo(false);
  }

  function updateCameraOn() {
    if (!callObject) {
      return;
    }
    callObject.setLocalVideo(true);
  }

  function logEvent(evt: DailyEventObject) {
    console.log("logEvent: " + evt.action, evt);
  }

  useDailyEvent("joining-meeting", logEvent);

  useDailyEvent("joined-meeting", meetingJoined);

  useDailyEvent("participant-joined", participantJoined);

  useDailyEvent("participant-updated", updateParticipant);

  useDailyEvent("track-started", logEvent);

  useDailyEvent("track-stopped", logEvent);

  useDailyEvent("started-camera", startedCamera);

  useDailyEvent("input-settings-updated", logEvent);

  useDailyEvent("loading", logEvent);

  useDailyEvent("loaded", logEvent);

  useDailyEvent("load-attempt-failed", logEvent);

  useDailyEvent("receive-settings-updated", logEvent);

  useDailyEvent(
    "left-meeting",
    useCallback((ev) => {
      logEvent(ev);
    }, [])
  );

  useDailyEvent("participant-left", logEvent);

  useDailyEvent("network-connection", logEvent);

  // useDailyEvent("network-quality-change", logEvent);

  useDailyEvent("camera-error", (evt) => {
    console.log("camera-error", evt);
  });

  useDailyEvent("error", (evt) => {
    console.log("error event", evt);
  });

  // Error logging for background effects
  useDailyEvent(
    "input-settings-updated",
    (evt: DailyEventObjectInputSettingsUpdated) => {
      console.log("input-settings-updated", evt);
    }
  );

  useDailyEvent("nonfatal-error", (evt: DailyEventObjectNonFatalError) => {
    console.log("nonfatal-error", evt);
  });

  const hiddenParticipantCount = callObject?.participantCounts().hidden ?? 0;
  const presentParticipantCount = callObject?.participantCounts().present ?? 0;

  const participantCounts = hiddenParticipantCount + presentParticipantCount;

  if (callObject?.meetingState() === "left-meeting")
    return <div>Left meeting</div>;

  return (
    <>
      <div className="App">
        <br />
        1. Join the call
        <br />
        {room ? `room=https://${room}` : "Add ?room=<room-id> to the url."}
        <br />
        <button onClick={() => load()}>Load</button> <br />
        <button onClick={() => preAuth()}>Preauth</button> <br />
        <button onClick={() => startCamera()}>Start Camera</button> <br />
        <button onClick={() => joinRoom()}>Join call</button>
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
        <button onClick={() => startScreenShare()}>Start Screen Share</button>
        <button onClick={() => stopScreenShare()}>Stop Screen Share</button>
        <button onClick={() => leaveRoom()}>Leave call</button>
        <br />
        <br />
        <button onClick={() => getInputDevices()}>Input Devices</button> <br />
        <button onClick={() => stopCamera()}>Camera Off</button> <br />
        <button onClick={() => updateCameraOn()}>Camera On</button> <br />
        <br />
      </div>
      <div>
        <h2>Participants</h2>
        <ul>
          {participantIds.map((id) => (
            /* Add buttons to subscribe and unsubscribe from each participant */
            <li key={id}>
              {id}{" "}
              <button
                onClick={() => {
                  callObject?.updateParticipant(id, {
                    setSubscribedTracks: { audio: true, video: true },
                  });
                }}
              >
                Subscribe
              </button>
              <button
                onClick={() => {
                  callObject?.updateParticipant(id, {
                    setSubscribedTracks: { audio: false, video: false },
                  });
                }}
              >
                Unsubscribe
              </button>
              <button
                onClick={() => {
                  callObject?.updateParticipant(id, {
                    setSubscribedTracks: { audio: "staged", video: "staged" },
                  });
                }}
              >
                Stage
              </button>
            </li>
          ))}
        </ul>
      </div>
      {participantIds.map((id) => (
        <DailyVideo type="video" key={id} automirror sessionId={id} />
      ))}
      {screens.map((screen) => (
        <DailyVideo
          type="screenVideo"
          key={screen.screenId}
          automirror
          sessionId={screen.session_id}
        />
      ))}
      <DailyAudio />

      <div id="meetingState">Meeting State: {callObject?.meetingState()}</div>
      {inputSettingsUpdated && <div>Input settings updated</div>}
      {errorMsg && <div id="errorMsg">{errorMsg}</div>}
      <div id="participantCount">Participant Counts: {participantCounts}</div>
      <div>Network quality: {network.quality}</div>
    </>
  );
}
