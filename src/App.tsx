import React from "react";
import Daily, {
  DailyEventObjectCameraError,
  DailyEventObjectInputSettingsUpdated,
  DailyEventObjectNonFatalError,
  DailyEventObjectParticipant,
  DailyEventObjectParticipants,
  DailyEventObjectTrack,
} from "@daily-co/daily-js";

import {
  useDaily,
  useDevices,
  useDailyEvent,
  useScreenShare,
} from "@daily-co/daily-react";

import "./styles.css";

console.log("Daily version: %s", Daily.version());

export default function App() {
  const callObject = useDaily();

  const queryParams = new URLSearchParams(window.location.search);
  const room = queryParams.get("room");

  const {
    cameras,
    setCamera,
    microphones,
    setMicrophone,
    speakers,
    setSpeaker,
  } = useDevices();

  const { startScreenShare, stopScreenShare, isSharingScreen } =
    useScreenShare();

  const currentCamera = cameras.find((c) => c.selected);
  const currentMicrophone = microphones.find((m) => m.selected);
  const currentSpeaker = speakers.find((s) => s.selected);

  useDailyEvent("camera-error", (evt: DailyEventObjectCameraError) => {
    console.log(evt);
  });

  function enableBlur() {
    if (!callObject) {
      return;
    }

    callObject
      .updateInputSettings({
        video: {
          processor: {
            type: "background-blur",
            config: { strength: 0.5 },
          },
        },
      })
      .then((foo) => {
        console.log("Background blur settings:", foo);
      })
      .catch((err) => {
        console.error("Background blur error:", err);
      });
  }

  function enableBackground() {
    if (!callObject) {
      return;
    }

    callObject
      .updateInputSettings({
        video: {
          processor: {
            type: "background-image",
            config: {
              source:
                "https://docs.daily.co/assets/guides-large-meetings-hero.jpeg",
            },
          },
        },
      })
      .then((foo) => {
        console.log("Background image settings:", foo);
      })
      .catch((err) => {
        console.error("Background image error:", err);
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

    callObject.startCamera();
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
    console.log("Participant joined meeting: ", evt);
  };

  const updateParticipant = (evt: DailyEventObjectParticipant) => {
    console.log("Participant updated: ", evt);
  };

  // mount the tracks from the track-started events
  const startTrack = (evt: DailyEventObjectTrack) => {
    console.log("Track started: ", evt);
    if (evt.track.kind === "audio" && evt.participant?.local === false) {
      let audiosDiv = document.getElementById("audios");
      let audioEl = document.createElement("audio");

      if (audiosDiv === null) {
        throw new Error("audios div not found");
      }

      if (audioEl === null) {
        throw new Error("audio element not found");
      }

      audiosDiv.appendChild(audioEl);
      audioEl.style.width = "100%";
      audioEl.srcObject = new MediaStream([evt.track]);
      audioEl.play();
      console.log("audioEl: ", audioEl);
    } else if (evt.track.kind === "video") {
      let videosDiv = document.getElementById("videos");
      let videoEl = document.createElement("video");

      if (videosDiv === null) {
        throw new Error("videos div not found");
      }

      if (videoEl === null) {
        throw new Error("video element not found");
      }

      videosDiv.appendChild(videoEl);
      videoEl.style.width = "100%";
      videoEl.srcObject = new MediaStream([evt.track]);
      videoEl.play();
      console.log("videoEl: ", videoEl);
    }
  };

  // Listen to track-stopped events and remove the video / audio elements
  function stopTrack(evt: DailyEventObjectTrack) {
    console.log("Track stopped: ", evt);
    if (evt.track.kind === "audio") {
      let audios = document.getElementsByTagName("audio");
      console.log("--- audios", audios);

      for (let audio of audios) {
        console.log(audio);
        audio.remove();
      }
    } else if (evt.track.kind === "video") {
      let vids = document.getElementsByTagName("video");
      for (let vid of vids) {
        const stream = vid.srcObject as MediaStream;
        if (stream.getVideoTracks()[0] === evt.track) {
          vid.remove();
        }
      }
    }
  }

  // Remove video elements and leave the room
  function leaveRoom() {
    if (!callObject) {
      return;
    }
    let vids = document.getElementsByTagName("video");
    for (let vid of vids) {
      vid.remove();
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
    callObject.updateParticipant("local", {
      setAudio: false,
      setVideo: false,
    });
  }

  function updateCameraOn() {
    if (!callObject) {
      return;
    }
    callObject.updateParticipant("local", {
      setAudio: true,
      setVideo: true,
    });
  }

  function logEvent(evt: any) {
    console.log("logEvent: ", evt);
  }

  useDailyEvent("joined-meeting", meetingJoined);

  useDailyEvent("joining-meeting", logEvent);

  useDailyEvent("track-started", startTrack);

  useDailyEvent("track-stopped", stopTrack);

  useDailyEvent("participant-joined", participantJoined);

  useDailyEvent("participant-updated", updateParticipant);

  useDailyEvent("started-camera", startedCamera);

  useDailyEvent("input-settings-updated", logEvent);

  useDailyEvent("loading", logEvent);

  useDailyEvent("loaded", logEvent);

  useDailyEvent("receive-settings-updated", logEvent);

  useDailyEvent("left-meeting", logEvent);

  useDailyEvent("participant-left", logEvent);

  useDailyEvent("network-connection", logEvent);

  useDailyEvent("network-quality-change", logEvent);

  useDailyEvent("camera-error", (evt) => {
    console.log("camera-error", evt);
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

  return (
    <>
      <div className="App">
        <br />
        1. Join the call
        <br />
        {room ? `room=https://${room}` : "Add ?room=<room-id> to the url."}
        <br />
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
        <button onClick={() => enableBlur()}>Enable Blur</button>
        <button onClick={() => enableBackground()}>Enable Background</button>
        <button onClick={() => startScreenShare()}>Start Screen Share</button>
        <button onClick={() => stopScreenShare()}>Stop Screen Share</button>
        <button onClick={() => leaveRoom()}>Leave call</button>
        <br />
        <br />
        <button onClick={() => getInputDevices()}>Input Devices</button> <br />
        <button onClick={() => preAuth()}>Preauth</button> <br />
        <button onClick={() => startCamera()}>Start Camera</button> <br />
        <button onClick={() => stopCamera()}>Publish Camera Off</button> <br />
        <button onClick={() => updateCameraOn()}>Publish Camera On</button>{" "}
        <br />
        <br />
      </div>
      <div id="videos"></div>
      <div id="audios"></div>
      <div id="meetingState">Meeting State: {callObject?.meetingState()}</div>
      <div id="participantCount">Participant Counts: {participantCounts}</div>
    </>
  );
}
