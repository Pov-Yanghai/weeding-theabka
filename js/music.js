(function () {
    "use strict";

    const audio = document.getElementById("weddingMusic");
    const toggle = document.getElementById("musicToggle");

    if (!audio || !toggle) {
        return;
    }

    const timeKey = "weddingMusicTime";
    let savedTime = Number.parseFloat(localStorage.getItem(timeKey));

    if (!Number.isFinite(savedTime) || savedTime < 0) {
        savedTime = 0;
    }

    function updateToggle() {
        const isPlaying = !audio.paused && !audio.ended;
        toggle.textContent = isPlaying ? "❚❚" : "♫";
        toggle.setAttribute("aria-label", isPlaying ? "Pause wedding music" : "Play wedding music");
        toggle.setAttribute("title", isPlaying ? "Pause wedding music" : "Play wedding music");
        toggle.setAttribute("aria-pressed", String(isPlaying));
    }

    function saveTime() {
        if (Number.isFinite(audio.currentTime)) {
            localStorage.setItem(timeKey, String(audio.currentTime));
        }
    }

    function playMusic() {
        return audio.play().catch(function (error) {
            updateToggle();
            if (error.name !== "NotAllowedError") {
                console.warn("Wedding music could not play.", error);
            }
        });
    }

    function toggleMusic() {
        if (audio.paused || audio.ended) {
            playMusic();
        } else {
            audio.pause();
        }
    }

    audio.addEventListener("loadedmetadata", function () {
        if (savedTime > 0 && savedTime < audio.duration) {
            audio.currentTime = savedTime;
        }
    }, { once: true });
    audio.addEventListener("play", updateToggle);
    audio.addEventListener("pause", function () {
        saveTime();
        updateToggle();
    });
    audio.addEventListener("ended", updateToggle);
    audio.addEventListener("error", function () {
        toggle.disabled = true;
        toggle.textContent = "!";
        toggle.setAttribute("aria-label", "Wedding music unavailable");
        toggle.setAttribute("title", "Wedding music unavailable");
        console.error("Wedding music failed to load.", audio.currentSrc || audio.src);
    });
    window.addEventListener("pagehide", saveTime);
    toggle.addEventListener("click", toggleMusic);

    window.weddingMusic = {
        play: playMusic,
        pause: function () { audio.pause(); },
        toggle: toggleMusic
    };

    updateToggle();

    if (audio.hasAttribute("autoplay") && audio.dataset.playOnLoad !== "false") {
        playMusic();
    }
})();
