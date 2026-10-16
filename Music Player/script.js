const tracks = [
  {
    title: "Golden Hour",
    artist: "Stillwave",
    album: "Session 01",
    art: "art-one",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    title: "Open Window",
    artist: "Stillwave",
    album: "Session 02",
    art: "art-two",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    title: "Softly, Slowly",
    artist: "Stillwave",
    album: "Session 03",
    art: "art-three",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
  {
    title: "Blue Skies",
    artist: "Stillwave",
    album: "Session 04",
    art: "art-four",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
  },
  {
    title: "A Walk",
    artist: "Stillwave",
    album: "Session 05",
    art: "art-five",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
  },
  {
    title: "Bloom",
    artist: "Stillwave",
    album: "Session 06",
    art: "art-six",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
  },
  {
    title: "Anchor",
    artist: "Stillwave",
    album: "Session 07",
    art: "art-seven",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
  },
  {
    title: "Holocene",
    artist: "Stillwave",
    album: "Session 08",
    art: "art-eight",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
  },
];

const audio = document.querySelector("#audio");
const playButton = document.querySelector("#play-button");
const previousButton = document.querySelector("#previous-button");
const nextButton = document.querySelector("#next-button");
const progressInput = document.querySelector("#progress");
const volumeInput = document.querySelector("#volume");
const muteButton = document.querySelector("#mute-button");
const autoplayButton = document.querySelector("#autoplay-button");
const shuffleButton = document.querySelector("#shuffle-button");
const repeatButton = document.querySelector("#repeat-button");
const favoriteButton = document.querySelector("#favorite-button");
const playlist = document.querySelector("#playlist-list");
const albumArt = document.querySelector("#album-art");
const playerMessage = document.querySelector("#player-message");
const addTracksButton = document.querySelector("#add-tracks-button");
const audioFileInput = document.querySelector("#audio-file-input");
const trackCount = document.querySelector("#track-count");
const supportedAudioExtensions = /\.(mp3|wav|m4a|aac|ogg|flac|opus)$/i;

let currentIndex = 0;
let autoplay = true;
let shuffle = false;
let repeat = false;
let lastVolume = Number(volumeInput.value);

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}

function setRangeProgress(input, value, maximum) {
  const percentage = maximum > 0 ? (value / maximum) * 100 : 0;
  input.style.setProperty("--range-progress", `${percentage}%`);
}

function renderPlaylist() {
  playlist.replaceChildren(
    ...tracks.map((track, index) => {
      const item = document.createElement("div");
      item.setAttribute("role", "listitem");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "playlist-track";
      button.setAttribute("aria-current", String(index === currentIndex));
      button.setAttribute("aria-label", `Play ${track.title} by ${track.artist}`);
      button.dataset.trackIndex = String(index);

      const number = document.createElement("span");
      number.className = "track-number";
      number.textContent = String(index + 1).padStart(2, "0");

      const playingIcon = document.createElement("span");
      playingIcon.className = "track-playing-icon";
      playingIcon.setAttribute("aria-hidden", "true");
      playingIcon.innerHTML = "<svg viewBox=\"0 0 16 16\"><rect x=\"2\" y=\"7\" width=\"2\" height=\"7\" rx=\"1\"/><rect x=\"7\" y=\"3\" width=\"2\" height=\"11\" rx=\"1\"/><rect x=\"12\" y=\"5\" width=\"2\" height=\"9\" rx=\"1\"/></svg>";

      const thumbnail = document.createElement("span");
      thumbnail.className = `track-thumb ${track.art}`;
      thumbnail.setAttribute("aria-hidden", "true");

      const metadata = document.createElement("span");
      metadata.className = "track-meta";
      const title = document.createElement("strong");
      title.textContent = track.title;
      const artist = document.createElement("span");
      artist.textContent = track.artist;
      metadata.append(title, artist);

      const duration = document.createElement("span");
      duration.className = "track-duration";
      duration.textContent = track.duration || "—:—";
      button.append(number, playingIcon, thumbnail, metadata, duration);
      button.addEventListener("click", () => selectTrack(index, true));
      item.append(button);
      return item;
    }),
  );
}

function updatePlaylistSelection() {
  playlist.querySelectorAll(".playlist-track").forEach((item, index) => {
    item.setAttribute("aria-current", String(index === currentIndex));
  });
}

function loadTrack(index) {
  currentIndex = (index + tracks.length) % tracks.length;
  const track = tracks[currentIndex];
  audio.src = track.src;
  document.querySelector("#track-title").textContent = track.title;
  document.querySelector("#track-artist").replaceChildren(
    document.createTextNode(`${track.artist} · ${track.album}`),
  );
  document.querySelector("#art-title").textContent = track.title.replace(/\s+/, "\n");
  document.querySelector("#art-subtitle").textContent = track.album;
  document.querySelector("#duration").textContent = "0:00";
  document.querySelector("#current-time").textContent = "0:00";
  progressInput.value = "0";
  setRangeProgress(progressInput, 0, 100);
  albumArt.className = `album-art ${track.art}`;
  favoriteButton.setAttribute("aria-label", `Add ${track.title} to favorites`);
  favoriteButton.setAttribute("aria-pressed", "false");
  playerMessage.textContent = "";
  updatePlaylistSelection();
}

async function playTrack() {
  playerMessage.textContent = "";
  try {
    await audio.play();
  } catch (error) {
    playerMessage.textContent = "This track could not be played. Check your connection and try again.";
    console.error("Audio playback failed:", error);
  }
}

function pauseTrack() {
  audio.pause();
}

function selectTrack(index, play) {
  loadTrack(index);
  if (play) void playTrack();
}

function goToNextTrack() {
  if (shuffle && tracks.length > 1) {
    let nextIndex = currentIndex;
    while (nextIndex === currentIndex) {
      nextIndex = Math.floor(Math.random() * tracks.length);
    }
    selectTrack(nextIndex, true);
    return;
  }

  selectTrack(currentIndex + 1, true);
}

playButton.addEventListener("click", () => {
  if (audio.paused) void playTrack();
  else pauseTrack();
});

previousButton.addEventListener("click", () => {
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }
  selectTrack(currentIndex - 1, true);
});

nextButton.addEventListener("click", goToNextTrack);

audio.addEventListener("play", () => {
  playButton.setAttribute("aria-label", "Pause");
  playerMessage.textContent = "";
});

audio.addEventListener("pause", () => {
  playButton.setAttribute("aria-label", "Play");
});

audio.addEventListener("timeupdate", () => {
  if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
  progressInput.value = String((audio.currentTime / audio.duration) * 100);
  setRangeProgress(progressInput, Number(progressInput.value), 100);
  document.querySelector("#current-time").textContent = formatTime(audio.currentTime);
});

audio.addEventListener("loadedmetadata", () => {
  if (!Number.isFinite(audio.duration)) return;
  const duration = formatTime(audio.duration);
  tracks[currentIndex].duration = duration;
  document.querySelector("#duration").textContent = duration;
  const currentDuration = playlist
    .querySelectorAll(".playlist-track")
    [currentIndex]?.querySelector(".track-duration");
  if (currentDuration) currentDuration.textContent = duration;
});

audio.addEventListener("ended", () => {
  if (repeat) {
    audio.currentTime = 0;
    void playTrack();
  } else if (autoplay) {
    goToNextTrack();
  } else {
    playButton.setAttribute("aria-label", "Play");
  }
});

audio.addEventListener("error", () => {
  playerMessage.textContent = "Audio could not be loaded. Check your connection and try again.";
});

addTracksButton.addEventListener("click", () => audioFileInput.click());

audioFileInput.addEventListener("change", () => {
  const selectedFiles = Array.from(audioFileInput.files || []);
  audioFileInput.value = "";
  const audioFiles = selectedFiles.filter(
    (file) => file.type.startsWith("audio/") || supportedAudioExtensions.test(file.name),
  );
  const skippedCount = selectedFiles.length - audioFiles.length;

  if (audioFiles.length === 0) {
    if (skippedCount > 0) {
      playerMessage.textContent = "No supported audio files were selected.";
    }
    return;
  }

  const firstNewIndex = tracks.length;
  audioFiles.forEach((file, offset) => {
    const title = file.name.replace(/\.[^.]+$/, "").trim() || "Untitled track";
    tracks.push({
      title,
      artist: "Local audio",
      album: "Added from your device",
      art: `art-${["one", "two", "three", "four", "five", "six", "seven", "eight"][(firstNewIndex + offset) % 8]}`,
      src: URL.createObjectURL(file),
    });
  });

  renderPlaylist();
  trackCount.textContent = `${String(tracks.length).padStart(2, "0")} TRACKS`;
  updatePlaylistSelection();
  playerMessage.textContent = `Added ${audioFiles.length} ${audioFiles.length === 1 ? "track" : "tracks"} to the playlist.${skippedCount ? ` Skipped ${skippedCount} unsupported ${skippedCount === 1 ? "file" : "files"}.` : ""}`;
});

progressInput.addEventListener("input", () => {
  setRangeProgress(progressInput, Number(progressInput.value), 100);
  if (Number.isFinite(audio.duration) && audio.duration > 0) {
    audio.currentTime = (Number(progressInput.value) / 100) * audio.duration;
  }
});

volumeInput.addEventListener("input", () => {
  audio.volume = Number(volumeInput.value);
  audio.muted = false;
  lastVolume = audio.volume;
  setRangeProgress(volumeInput, audio.volume, 1);
  muteButton.setAttribute("aria-label", "Mute");
});

muteButton.addEventListener("click", () => {
  if (audio.muted || audio.volume === 0) {
    audio.muted = false;
    audio.volume = lastVolume || 0.72;
    volumeInput.value = String(audio.volume);
    muteButton.setAttribute("aria-label", "Mute");
  } else {
    lastVolume = audio.volume;
    audio.muted = true;
    audio.volume = 0;
    volumeInput.value = "0";
    muteButton.setAttribute("aria-label", "Unmute");
  }
  setRangeProgress(volumeInput, Number(volumeInput.value), 1);
});

autoplayButton.addEventListener("click", () => {
  autoplay = !autoplay;
  autoplayButton.setAttribute("aria-pressed", String(autoplay));
});

shuffleButton.addEventListener("click", () => {
  shuffle = !shuffle;
  shuffleButton.setAttribute("aria-pressed", String(shuffle));
});

repeatButton.addEventListener("click", () => {
  repeat = !repeat;
  repeatButton.setAttribute("aria-pressed", String(repeat));
  repeatButton.setAttribute("aria-label", repeat ? "Repeat track" : "Repeat off");
});

favoriteButton.addEventListener("click", () => {
  const isFavorite = favoriteButton.getAttribute("aria-pressed") !== "true";
  favoriteButton.setAttribute("aria-pressed", String(isFavorite));
  favoriteButton.setAttribute(
    "aria-label",
    `${isFavorite ? "Remove" : "Add"} ${tracks[currentIndex].title} ${isFavorite ? "from" : "to"} favorites`,
  );
});

audio.volume = Number(volumeInput.value);
setRangeProgress(volumeInput, audio.volume, 1);
trackCount.textContent = `${String(tracks.length).padStart(2, "0")} TRACKS`;
renderPlaylist();
loadTrack(currentIndex);

window.addEventListener("pagehide", () => {
  tracks.forEach((track) => {
    if (track.src.startsWith("blob:")) URL.revokeObjectURL(track.src);
  });
});