//jshint esversion:6

const button = document.querySelector(".btn"),
  darkroom = document.querySelector(".darkroom"),
  giftroom = document.querySelector(".giftroom"),
  hallway = document.querySelector(".hallway"),
  room = document.querySelector(".empty-room"),
  flash = document.querySelector(".flash");

// These are the text elements that hold messages to be displayed in the respective screes

const blackText = document.querySelectorAll(".bb-text"), // msgs in the dark room scene
  giftText = document.querySelectorAll(".gift-text"), // msgs in the gift scene
  hallText = document.querySelectorAll(".hall-text"), // msgs in the hallway scene
  roomText = document.querySelectorAll(".room-text"), // msgs in empty room scene
  CTAtext = document.querySelector(".btn-ref");

//Elements in the card page

const frames = document.querySelectorAll(".frame"),
  msgWindow = document.querySelector(".scroll"), // this one has the message frame in [0] and card fram in [1]
  msg = document.querySelector(".text"); // the Message para

//Sfx files

const light = document.querySelector(".switch-aud"),
  blast = document.querySelector(".blast-aud"),
  door = document.querySelector(".door-aud"),
  haunt = document.querySelector(".haunt-aud"),
  music = document.querySelector(".hbd-aud");

//Horror overlays

const vignette = document.querySelector(".vignette"),
  blackout = document.querySelector(".blackout"),
  jumpFlash = document.querySelector(".jump-flash"),
  eyes = document.querySelector(".eyes"),
  pupils = document.querySelectorAll(".pupil");

//  readMsg() displays the paras in each scene successively. It takes an array of the para elements as input.

const readMsg = (text) => {
  for (let i = 0; i < text.length; i++) {
    // this loop goes through all the text msg paras
    setTimeout(() => {
      // A timeout of 5s ia applied to all text elements so that appear successively one after the other
      text[i].classList.add("read"); // this adds a fadeIn-fadeOut animation to elements
      if (i === text.length - 1) {
        // this ensures that the button appears only after the last text is displayed.
        button.style.display = "inline-block";
        CTAtext.style.display = "block";
      }
    }, 5000 * i);
  }
};

// transition() is animation for change from one scene to another. It takes the current scene div element as input.

const transition = (currentScene) => {
  currentScene.classList.add("fade-in");
  currentScene.style.opacity = "0";
  button.style.display = "none";
  CTAtext.style.display = "none";
};

//Horror helpers

const getCtx = () => {
  if (!audioCtx) audioCtx = new (window.AudioContext ||
    window.webkitAudioContext)();
  return audioCtx;
};

let audioCtx = null,
  heartbeatTimer = null;

const startHeartbeat = () => {
  const ac = getCtx();
  ac.resume();
  const thump = (time, freq) => {
    const osc = ac.createOscillator(),
      gain = ac.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(0.9, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.16);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(time);
    osc.stop(time + 0.2);
  };
  const beat = () => {
    const t = ac.currentTime;
    thump(t, 60);
    thump(t + 0.13, 48);
  };
  beat();
  heartbeatTimer = setInterval(beat, 1000);
};

const stopHeartbeat = () => {
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  heartbeatTimer = null;
};

const playScream = () => {
  const ac = getCtx();
  ac.resume();
  const dur = 0.55;
  const buffer = ac.createBuffer(
    1,
    Math.floor(ac.sampleRate * dur),
    ac.sampleRate
  );
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    const t = i / ac.sampleRate;
    const decay = Math.pow(1 - t / dur, 1.6);
    const freq = 1100 - t * 1400 + Math.random() * 600;
    data[i] =
      Math.sin(2 * Math.PI * freq * t) * 0.7 * decay +
      (Math.random() * 2 - 1) * 0.35 * decay;
  }
  const src = ac.createBufferSource();
  src.buffer = buffer;
  src.connect(ac.destination);
  src.start();
};

//Eyes follow the cursor

if (eyes) {
  document.addEventListener("mousemove", (e) => {
    const rect = eyes.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const offset = Math.min(12, dist * 0.06);
    const px = (dx / dist) * offset,
      py = (dy / dist) * offset;
    pupils.forEach((p) => (p.style.transform = `translate(${px}px, ${py}px)`));
  });
}

//Animation Code

/*
    In the beginning, the black page appears signifying a dark room and after displaying the msg paras
    one by one, a button(bulb) appears and the user is asked to click the button to swith on the lights.
*/

export const animate = function () {
  CTAtext.innerHTML = "Click the Light Bulb.";

  readMsg(blackText);

  button.addEventListener("click", function () {
    if (button.classList.contains("switch")) {
      /* 
              When the switch is pressed, the black div will wipe out and the backgroung scene with no 
              elements will appear, signifying that the lights are turned on and the room is empty. Then 
              the msg will be displayed after which, the user will be asked to move out and the button with
              door icon will appear. 
          */

      light.play();
      transition(darkroom);
      CTAtext.innerHTML = "Click the Door";
      setTimeout(function () {
        button.classList.add("door-out");
        button.classList.remove("switch");
        darkroom.style.display = "none";
        readMsg(roomText);
      }, 4000);
    } else if (button.classList.contains("door-out")) {
      /* 
              when the door is pressed, scene changes to cemetry. Again, the msg will be displayed, after 
              which, the user will be asked to come inside and the button with door will appear again.
          */

      door.play();
      transition(room);
      vignette.classList.add("active");
      hallway.classList.add("hall-shake");
      startHeartbeat();
      setTimeout(function () {
        haunt.play();
        haunt.loop = true;
        button.classList.add("door-in");
        button.classList.remove("door-out");
        room.style.display = "none";
        readMsg(hallText);
      }, 4000);
    } else if (button.classList.contains("door-in")) {
      /* 
              when the door is pressed, scene changes to the gift room. Again, the msg will be displayed, after 
              which, the user will be asked to open the gift and the button with gift will appear.
          */

      door.play();
      transition(hallway);
      CTAtext.innerHTML = "Click the Gift";
      setTimeout(function () {
        button.classList.add("gift");
        button.classList.remove("door-in");
        hallway.style.display = "none";
        readMsg(giftText);
      }, 4000);
    } else if (button.classList.contains("gift")) {
      /*
              when the gift is pressed, everything goes silent and the screen goes pitch black,
              then a loud scream + static flash hits, and only after that the explosion fades in
              and the message frame appears.
          */

      stopHeartbeat();
      haunt.pause();
      blackout.classList.add("active");
      giftroom.style.display = "none";
      transition(flash);

      setTimeout(function () {
        blackout.classList.remove("active");
        playScream();
        jumpFlash.classList.add("active");

        setTimeout(function () {
          jumpFlash.classList.remove("active");
          vignette.classList.remove("active");
          hallway.classList.remove("hall-shake");

          blast.play();
          music.loop = true;
          music.play();

          if (!process.env.SCROLL_MSG) {
            frames[0].style.display = "flex";
            setTimeout(() => {
              frames[0].classList.add("appear");
              frames[0].style.opacity = "1";
            }, 1500);
            return;
          }

          //This value is stored in the --readTime css variable of root element and is calculated dynamically at build time.
          const readTime =
            parseInt(
              getComputedStyle(document.documentElement).getPropertyValue(
                "--readTime"
              )
            ) + 5;

          frames[1].style.display = "flex";

          setTimeout(() => {
            frames[1].classList.add("appear");
            frames[1].style.opacity = "1";
            msg.classList.add("move-up");
          }, 1500);

          setTimeout(() => {
            msg.style.transform = "translateY(-100%)";
            flash.style.display = "none";
          }, 5000);

          setTimeout(() => {
            msgWindow.classList.add("fade-in");
            msgWindow.style.opacity = "0";
          }, readTime * 1000);

          setTimeout(() => {
            frames[1].style.display = "none";
            frames[0].style.display = "flex";
            frames[0].classList.add("appear");
            frames[0].style.opacity = "1";
          }, (readTime + 3) * 1000);
        }, 400);
      }, 1600);
    }
  });
};
