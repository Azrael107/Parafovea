import { useState, useEffect, useRef } from "react";
import { useScene } from "../context/SceneContext";
import soundManager from "../systems/SoundManager";
import { HOME_SOUNDS, UI_SOUNDS } from "../constants/soundCatalog";

const styles = {
  root: {
    position: "fixed",
    inset: 0,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontFamily: "sans-serif",
  },
  background: {
    position: "absolute",
    inset: 0,
    zIndex: 0,
    background: "#0a0a12",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundImage: "url(/img/space/home.png)",
  },
  title: {
    fontSize: "clamp(2rem, 8vw, 4rem)",
    fontWeight: 900,
    letterSpacing: "0.2em",
    marginBottom: "2rem",
    marginTop: "-15vh",
    textShadow: "0 0 20px rgba(255,255,255,0.3)",
  },
  optionsContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
    zIndex: 3,
    marginTop: "4.6rem",
    minHeight: "12rem",
    width: "min(72vw, 900px)",
  },
  tree: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    gap: "7.2rem",
    width: "100%",
    position: "relative",
  },
  tierColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "1.35rem",
    minWidth: 170,
  },
  textNode: {
    border: "none",
    background: "transparent",
    padding: 0,
    fontSize: "1.04rem",
    textTransform: "uppercase",
    letterSpacing: "0.17em",
    color: "#fff",
    cursor: "none",
    textAlign: "left",
    fontFamily: "'Cinzel', 'Trajan Pro', 'Times New Roman', serif",
    fontWeight: 600,
    whiteSpace: "nowrap",
    textShadow:
      "0 1px 0 rgba(255,255,255,0.96), 0 -1px 0 rgba(155,155,155,0.45), 0 0 9px rgba(255,255,255,0.2), 0 0 16px rgba(255,255,255,0.1)",
    transition: "opacity 200ms ease, transform 200ms ease, text-shadow 200ms ease",
  },
  nodeRow: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.65rem",
    whiteSpace: "nowrap",
  },
  optionFlareNode: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.96)",
    boxShadow: "0 0 6px rgba(255,255,255,0.7), 0 0 12px rgba(255,255,255,0.36)",
    flexShrink: 0,
  },
  optionFlareNodeDanger: {
    background: "rgba(255,86,86,0.98)",
    boxShadow: "0 0 6px rgba(255,86,86,0.72), 0 0 12px rgba(255,86,86,0.38)",
  },
  dangerText: {
    color: "rgba(255,120,120,0.98)",
    textShadow: "0 0 8px rgba(255,110,110,0.45), 0 0 16px rgba(255,110,110,0.24)",
  },
  infoPanel: {
    width: "min(74vw, 920px)",
    minHeight: "11rem",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    color: "#fff",
    fontFamily: "'Cinzel', 'Trajan Pro', 'Times New Roman', serif",
    letterSpacing: "0.08em",
    textShadow: "0 0 10px rgba(255,255,255,0.12)",
  },
  infoTitle: {
    margin: 0,
    fontSize: "1.08rem",
    textTransform: "uppercase",
    letterSpacing: "0.16em",
  },
  infoBody: {
    margin: 0,
    lineHeight: 1.55,
    whiteSpace: "pre-line",
    opacity: 0.95,
    fontSize: "0.95rem",
  },
  infoBack: {
    border: "none",
    background: "transparent",
    padding: 0,
    cursor: "none",
    textAlign: "left",
    fontFamily: "'Cinzel', 'Trajan Pro', 'Times New Roman', serif",
    fontSize: "0.95rem",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#fff",
    textShadow: "0 0 10px rgba(255,255,255,0.16)",
  },
  subtitleBar: {
    position: "absolute",
    left: "10%",
    right: "10%",
    bottom: "4.5vh",
    minHeight: 48,
    pointerEvents: "none",
    opacity: 0,
    zIndex: 5,
  },
};

const STARTUP_ZOOM_LIMIT = 2.2;
const ZOOM_START = 1;
const ZOOM_RANGE = STARTUP_ZOOM_LIMIT - ZOOM_START;
const DECAY_RATE = 0.2;
const START_POWER = 1.85;

const SWAY_X_PX = 6;
const SWAY_Y_PX = 4;
const SWAY_DEG = 0.06;
const SWAY_PERIOD_X = 7;
const SWAY_PERIOD_Y = 5.5;
const SWAY_PERIOD_ROT = 11;

const ZOOM_ORIGIN_ELLIPSE_A_PCT = 10;
const ZOOM_ORIGIN_ELLIPSE_B_PCT = 7;

const INTRO_DURATION = 3;
const ZOOM_START_DELAY = 2;
const WHITE_FADE_DURATION = 2.5;
const START_PROMPT_FADE_MS = 700;
const FLARE_PEAK_SCALE = 1.4;
const FLARE_ROTATION_DEG = -360;
const FLARE_SIZE_VMIN = 20;
const PRE_ZOOM_TURB_X_PX = 0.3;
const PRE_ZOOM_TURB_Y_PX = 0.2;
const PRE_ZOOM_TURB_DEG = 0.0035;
const PRE_ZOOM_TURB_FREQ_X = 2.6;
const PRE_ZOOM_TURB_FREQ_Y = 3.4;
const PRE_ZOOM_TURB_FREQ_R = 1.8;
const ZOOM_END_PROGRESS_THRESHOLD = 0.992;
const TITLE_DELAY_AFTER_ZOOM_END_SEC = 2;
const TITLE_SQUASH_START_Y = 0.2;
const TITLE_STRETCH_DURATION_MS = 700;
const TITLE_HOVER_ABERRATION_BLUR_PX = 6;
const TITLE_HOVER_ABERRATION_INNER = 22;
const TITLE_HOVER_ABERRATION_OUTER = 68;
const TITLE_HOVER_ABERRATION_OPACITY = 0.95;
const CURSOR_SIZE_PX = 34;
const CURSOR_GROW_DURATION_MS = 420;
const CURSOR_IDLE_THRESHOLD_MS = 10000;
const BLINK_IDLE_MIN_INTERVAL_MS = 7000;
const BLINK_IDLE_MAX_INTERVAL_MS = 13000;
const BLINK_ACTIVE_MIN_INTERVAL_MS = 15000;
const BLINK_ACTIVE_MAX_INTERVAL_MS = 26000;
const BLINK_CLOSE_MS = 520;
const BLINK_HOLD_MS = 280;
const BLINK_OPEN_MS = 760;
const BLINK_MAX_COVER = 1;
const CLICK_JIGGLE_DURATION_MS = 420;
const CLICK_JIGGLE_TRANSLATE_PX = 4;
const CLICK_JIGGLE_ROT_DEG = 0.12;
const CLICK_JIGGLE_FREQ_HZ = 18;
const START_EXIT_FADE_DELAY_MS = 1500;
const START_EXIT_FADE_DURATION_MS = 900;

const HOME_AUDIO_TIMELINE_SEC = {
  EXPLOSION: 0,
  STEAM: ZOOM_START_DELAY + 0.6, // pushed back by +1.0s from previous timing
  BREATH_START: 3,
};

const HOME_BG_SUN_PX = { x: 2048, y: 2048 };
const HOME_BG_IMAGE_WIDTH = 8192;
const HOME_BG_IMAGE_HEIGHT = 4096;

function getSunPositionPx(containerWidth, containerHeight) {
  const w = containerWidth ?? window.innerWidth;
  const h = containerHeight ?? window.innerHeight;
  const s = Math.max(w / HOME_BG_IMAGE_WIDTH, h / HOME_BG_IMAGE_HEIGHT);
  const imageLeft = (w - HOME_BG_IMAGE_WIDTH * s) / 2;
  const imageTop = (h - HOME_BG_IMAGE_HEIGHT * s) / 2;
  return {
    left: imageLeft + HOME_BG_SUN_PX.x * s,
    top: imageTop + HOME_BG_SUN_PX.y * s,
  };
}

function preloadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = reject;
    img.src = src;
  });
}

function HomeCharacterAudio({ sceneReady, sceneStarted }) {
  const currentBreathRef = useRef(null);

  useEffect(() => {
    if (!sceneReady || !sceneStarted) return undefined;

    const stopBreath = () => {
      if (currentBreathRef.current) {
        currentBreathRef.current.pause();
        currentBreathRef.current = null;
      }
    };

    const startBreath = () => {
      if (currentBreathRef.current) return;
      currentBreathRef.current = soundManager.playSFX(HOME_SOUNDS.GASMASK_BREATH.key, {
        loop: true,
        volume: 0.4,
      });
    };

    const scheduleAt = (seconds, key, fn) => {
      return window.setTimeout(() => fn(), seconds * 1000);
    };

    const timers = [
      scheduleAt(HOME_AUDIO_TIMELINE_SEC.EXPLOSION, "explosion", () =>
        soundManager.playSFX(HOME_SOUNDS.EXPLOSION.key, { volume: 0.75 })
      ),
      scheduleAt(HOME_AUDIO_TIMELINE_SEC.STEAM, "steam", () =>
        soundManager.playSFX(HOME_SOUNDS.STEAM.key, { volume: 0.65 })
      ),
      scheduleAt(HOME_AUDIO_TIMELINE_SEC.BREATH_START, "breath", startBreath),
    ];

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      stopBreath();
    };
  }, [sceneReady, sceneStarted]);

  return null;
}

export default function HomeScene() {
  const { transitionTo } = useScene();
  const [activeRootId, setActiveRootId] = useState(null);
  const [activeChildId, setActiveChildId] = useState(null);
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [sceneReady, setSceneReady] = useState(false);
  const [sceneStarted, setSceneStarted] = useState(false);
  const [infoPage, setInfoPage] = useState(null);
  const [isStartFading, setIsStartFading] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [exitFadeOpacity, setExitFadeOpacity] = useState(0);
  const [startPromptOpacity, setStartPromptOpacity] = useState(1);
  const [showTitle, setShowTitle] = useState(false);
  const [titleStretched, setTitleStretched] = useState(false);
  const [titleHovered, setTitleHovered] = useState(false);
  const [blinkCover, setBlinkCover] = useState(0);
  const [cursorPos, setCursorPos] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [cursorRotDeg, setCursorRotDeg] = useState(0);
  const [zoom, setZoom] = useState(ZOOM_START);
  const [sway, setSway] = useState({ x: 0, y: 0, rot: 0 });
  const [jiggle, setJiggle] = useState({ x: 0, y: 0, rot: 0 });
  const [zoomOrigin, setZoomOrigin] = useState(() => ({
    x: 50 + ZOOM_ORIGIN_ELLIPSE_A_PCT * Math.cos(Math.PI),
    y: 50 - ZOOM_ORIGIN_ELLIPSE_B_PCT * Math.sin(Math.PI),
  }));
  const [introWhiteOpacity, setIntroWhiteOpacity] = useState(1);
  const [introFlareScale, setIntroFlareScale] = useState(0);
  const [introFlareRot, setIntroFlareRot] = useState(0);
  const [flarePosition, setFlarePosition] = useState(null);
  const startTimeRef = useRef(null);
  const rootRef = useRef(null);
  const zoomEndReachedRef = useRef(false);
  const titleRevealTimeoutRef = useRef(null);
  const blinkTimeoutRef = useRef(null);
  const blinkHoldTimeoutRef = useRef(null);
  const blinkOpenTimeoutRef = useRef(null);
  const lastCursorMoveAtRef = useRef(performance.now());
  const jiggleStartAtRef = useRef(null);
  const exitFadeTimeoutRef = useRef(null);
  const exitTransitionTimeoutRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const preloadSceneAssets = async () => {
      soundManager.init();
      const results = await Promise.allSettled([
        preloadImage("/img/space/home.png"),
        preloadImage("/img/white%20flare.png"),
        soundManager.loadSound(HOME_SOUNDS.EXPLOSION.key, HOME_SOUNDS.EXPLOSION.path, { loop: HOME_SOUNDS.EXPLOSION.loop }),
        soundManager.loadSound(HOME_SOUNDS.STEAM.key, HOME_SOUNDS.STEAM.path, { loop: HOME_SOUNDS.STEAM.loop }),
        soundManager.loadSound(HOME_SOUNDS.GASMASK_BREATH.key, HOME_SOUNDS.GASMASK_BREATH.path, { loop: HOME_SOUNDS.GASMASK_BREATH.loop }),
        soundManager.loadSound(UI_SOUNDS.MENU_CLICK.key, UI_SOUNDS.MENU_CLICK.path, { loop: UI_SOUNDS.MENU_CLICK.loop }),
        soundManager.loadSound(UI_SOUNDS.START_EXIT.key, UI_SOUNDS.START_EXIT.path, { loop: UI_SOUNDS.START_EXIT.loop }),
      ]);

      if (!cancelled) {
        const failed = results.filter((r) => r.status === "rejected");
        if (failed.length > 0) {
          console.warn("Home scene preload had failures", failed);
        }
        setSceneReady(true);
      }
    };

    preloadSceneAssets();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      window.clearTimeout(exitFadeTimeoutRef.current);
      window.clearTimeout(exitTransitionTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const onMouseMove = (e) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
      lastCursorMoveAtRef.current = performance.now();
    };
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  useEffect(() => {
    if (!showTitle) return undefined;

    const randInterval = () => {
      const idleForMs = performance.now() - lastCursorMoveAtRef.current;
      const isCursorIdle = idleForMs >= CURSOR_IDLE_THRESHOLD_MS;
      const min = isCursorIdle ? BLINK_IDLE_MIN_INTERVAL_MS : BLINK_ACTIVE_MIN_INTERVAL_MS;
      const max = isCursorIdle ? BLINK_IDLE_MAX_INTERVAL_MS : BLINK_ACTIVE_MAX_INTERVAL_MS;
      return min + Math.random() * (max - min);
    };

    const scheduleBlink = () => {
      blinkTimeoutRef.current = window.setTimeout(() => {
        setBlinkCover(BLINK_MAX_COVER);
        blinkHoldTimeoutRef.current = window.setTimeout(() => {
          blinkOpenTimeoutRef.current = window.setTimeout(() => {
            setBlinkCover(0);
            scheduleBlink();
          }, BLINK_OPEN_MS);
        }, BLINK_HOLD_MS);
      }, randInterval());
    };

    scheduleBlink();
    return () => {
      window.clearTimeout(blinkTimeoutRef.current);
      window.clearTimeout(blinkHoldTimeoutRef.current);
      window.clearTimeout(blinkOpenTimeoutRef.current);
      setBlinkCover(0);
    };
  }, [showTitle]);

  useEffect(() => {
    if (!showTitle) return undefined;
    let rafId;
    const spin = () => {
      setCursorRotDeg((prev) => (prev + 0.35) % 360);
      rafId = requestAnimationFrame(spin);
    };
    rafId = requestAnimationFrame(spin);
    return () => cancelAnimationFrame(rafId);
  }, [showTitle]);

  const handleStart = () => {
    if (!sceneReady || sceneStarted || isStartFading) return;
    setIsStartFading(true);
    setStartPromptOpacity(0);
    window.setTimeout(() => {
      setSceneStarted(true);
      setIsStartFading(false);
    }, START_PROMPT_FADE_MS);
  };

  const triggerJiggle = () => {
    jiggleStartAtRef.current = performance.now();
  };

  const handleRootPointerDown = ({ target }) => {
    if (!sceneStarted) return;
    const interactive = target?.closest?.("[data-ui-interactive='true']");
    if (interactive) return;
    triggerJiggle();
  };

  useEffect(() => {
    let rafId = requestAnimationFrame(function measure() {
      requestAnimationFrame(() => {
        if (rootRef.current) {
          const { width, height } = rootRef.current.getBoundingClientRect();
          setFlarePosition(getSunPositionPx(width, height));
        }
      });
    });
    return () => cancelAnimationFrame(rafId);
  }, []);

  useEffect(() => {
    if (!sceneReady || !sceneStarted) return undefined;
    startTimeRef.current = performance.now();
    zoomEndReachedRef.current = false;
    setShowTitle(false);
    setTitleStretched(false);
    let rafId;
    const tick = () => {
      const now = performance.now();
      const elapsed = (now - startTimeRef.current) / 1000;
      if (jiggleStartAtRef.current) {
        const tMs = now - jiggleStartAtRef.current;
        if (tMs >= CLICK_JIGGLE_DURATION_MS) {
          jiggleStartAtRef.current = null;
          setJiggle({ x: 0, y: 0, rot: 0 });
        } else {
          const p = tMs / CLICK_JIGGLE_DURATION_MS;
          const damp = (1 - p) * (1 - p);
          const t = tMs / 1000;
          const osc = Math.sin(t * Math.PI * 2 * CLICK_JIGGLE_FREQ_HZ) * damp;
          setJiggle({
            x: CLICK_JIGGLE_TRANSLATE_PX * osc,
            y: CLICK_JIGGLE_TRANSLATE_PX * 0.7 * Math.cos(t * Math.PI * 2 * CLICK_JIGGLE_FREQ_HZ * 0.85) * damp,
            rot: CLICK_JIGGLE_ROT_DEG * osc,
          });
        }
      }

      if (elapsed < INTRO_DURATION) {
        const t = elapsed / INTRO_DURATION;
        const whiteT = Math.min(1, elapsed / WHITE_FADE_DURATION);
        setIntroWhiteOpacity(1 - whiteT * whiteT);
        setIntroFlareScale(4 * FLARE_PEAK_SCALE * t * (1 - t));
        setIntroFlareRot(t * FLARE_ROTATION_DEG);
      } else {
        setIntroWhiteOpacity(0);
        setIntroFlareScale(0);
        setIntroFlareRot(FLARE_ROTATION_DEG);
      }

      if (elapsed < ZOOM_START_DELAY) {
        setZoom(ZOOM_START);
        setSway({
          x: PRE_ZOOM_TURB_X_PX * Math.sin(elapsed * Math.PI * 2 * PRE_ZOOM_TURB_FREQ_X),
          y: PRE_ZOOM_TURB_Y_PX * Math.sin(elapsed * Math.PI * 2 * PRE_ZOOM_TURB_FREQ_Y + 0.7),
          rot: PRE_ZOOM_TURB_DEG * Math.sin(elapsed * Math.PI * 2 * PRE_ZOOM_TURB_FREQ_R),
        });
        setZoomOrigin({
          x: 50 + ZOOM_ORIGIN_ELLIPSE_A_PCT * Math.cos(Math.PI),
          y: 50 - ZOOM_ORIGIN_ELLIPSE_B_PCT * Math.sin(Math.PI),
        });
      } else {
        const zoomElapsed = elapsed - ZOOM_START_DELAY;
        const tCurved = Math.pow(zoomElapsed, START_POWER);
        const z = STARTUP_ZOOM_LIMIT - ZOOM_RANGE * Math.exp(-DECAY_RATE * tCurved);
        const spiralProgress = (z - ZOOM_START) / ZOOM_RANGE;
        setZoom(z);
        if (!zoomEndReachedRef.current && spiralProgress >= ZOOM_END_PROGRESS_THRESHOLD) {
          zoomEndReachedRef.current = true;
          window.clearTimeout(titleRevealTimeoutRef.current);
          titleRevealTimeoutRef.current = window.setTimeout(() => {
            setShowTitle(true);
            requestAnimationFrame(() => setTitleStretched(true));
          }, TITLE_DELAY_AFTER_ZOOM_END_SEC * 1000);
        }
        setSway({
          x: SWAY_X_PX * Math.sin((elapsed * Math.PI * 2) / SWAY_PERIOD_X),
          y: SWAY_Y_PX * Math.sin((elapsed * Math.PI * 2) / SWAY_PERIOD_Y),
          rot: SWAY_DEG * Math.sin((elapsed * Math.PI * 2) / SWAY_PERIOD_ROT),
        });
        const angle = Math.PI - 2 * Math.PI * spiralProgress;
        setZoomOrigin({
          x: 50 + ZOOM_ORIGIN_ELLIPSE_A_PCT * Math.cos(angle),
          y: 50 - ZOOM_ORIGIN_ELLIPSE_B_PCT * Math.sin(angle),
        });
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(titleRevealTimeoutRef.current);
    };
  }, [sceneReady, sceneStarted]);

  const handleSinglePlayer = (mode) => {
    if (isExiting) return;
    setIsExiting(true);
    soundManager.playSFX(UI_SOUNDS.START_EXIT.key, { volume: 0.66 });
    exitFadeTimeoutRef.current = window.setTimeout(() => {
      setExitFadeOpacity(1);
    }, START_EXIT_FADE_DELAY_MS);
    exitTransitionTimeoutRef.current = window.setTimeout(() => {
      transitionTo("tutorial");
    }, START_EXIT_FADE_DELAY_MS + START_EXIT_FADE_DURATION_MS);
  };

  const handleMultiplayer = (mode) => {};

  const handleLoadProgress = () => {};

  const menuTree = [
    {
      id: "campaign",
      label: "Campaign",
      children: [
        {
          id: "single",
          label: "Single player",
          branches: [
            { id: "new-game-campaign", label: "New game", onClick: () => handleSinglePlayer("campaign") },
            { id: "load-campaign", label: "Load progress", onClick: handleLoadProgress },
            { id: "bug-campaign", label: "Bug?", accent: "danger", onClick: () => {} },
          ],
        },
        {
          id: "multiplayer",
          label: "Multiplayer",
          branches: [
            { id: "host-campaign", label: "Host", onClick: () => handleMultiplayer("campaign") },
            { id: "join-campaign", label: "Join", onClick: () => handleMultiplayer("campaign") },
          ],
        },
      ],
    },
    {
      id: "survival",
      label: "Survival",
      children: [
        {
          id: "single",
          label: "Single player",
          branches: [
            { id: "new-game-survival", label: "New game", onClick: () => handleSinglePlayer("survival") },
            { id: "load-survival", label: "Load progress", onClick: handleLoadProgress },
            { id: "bug-survival", label: "Bug?", accent: "danger", onClick: () => {} },
          ],
        },
        {
          id: "multiplayer",
          label: "Multiplayer",
          branches: [
            { id: "host-survival", label: "Host", onClick: () => handleMultiplayer("survival") },
            { id: "join-survival", label: "Join", onClick: () => handleMultiplayer("survival") },
          ],
        },
      ],
    },
    {
      id: "options",
      label: "Options",
      children: [
        {
          id: "audio",
          label: "Audio",
          branches: [],
        },
        {
          id: "brightness",
          label: "Brightness",
          branches: [],
        },
        {
          id: "controls",
          label: "Controls",
          branches: [],
        },
      ],
    },
    {
      id: "attributions",
      label: "Attributions",
      children: [
        {
          id: "attributions-open",
          label: "Open",
          branches: [
            {
              id: "attributions-description",
              label: "Description",
              onClick: () =>
                setInfoPage({
                  title: "Attributions - Description",
                  body:
                    "This page lists third-party assets used in Parafovea and their source links.\n\nExternal links lead to third-party websites. You are responsible for reviewing those destinations and their terms.",
                }),
            },
            {
              id: "attributions-links",
              label: "Links",
              onClick: () =>
                setInfoPage({
                  title: "Attributions - Links",
                  body:
                    "Add your external asset source URLs here.\n\nExample format:\n- Asset Name: https://example.com\n- Asset Name: https://example.com",
                }),
            },
          ],
        },
      ],
    },
    {
      id: "credits",
      label: "Credits",
      children: [
        {
          id: "credits-open",
          label: "Open",
          branches: [
            {
              id: "credits-description",
              label: "Description",
              onClick: () =>
                setInfoPage({
                  title: "Credits - Description",
                  body:
                    "This page documents contributors and acknowledgements for Parafovea.\n\nYou can list role, contribution, and optional links.",
                }),
            },
            {
              id: "credits-list",
              label: "Credits",
              onClick: () =>
                setInfoPage({
                  title: "Credits",
                  body:
                    "Add credits here.\n\nExample format:\n- Name - Role\n- Name - Role",
                }),
            },
          ],
        },
      ],
    },
  ];

  const activeRoot = menuTree.find(({ id }) => id === activeRootId) ?? null;
  const secondTier = activeRoot?.children ?? [];
  const activeSecond = secondTier.find(({ id }) => id === activeChildId) ?? null;
  const thirdTier = activeSecond?.branches ?? [];
  const hasSecondTier = secondTier.length > 0;
  const hasThirdTier = thirdTier.length > 0;

  const handleRootClick = (id) => {
    soundManager.playSFX(UI_SOUNDS.MENU_CLICK.key, { volume: 0.5 });
    setInfoPage(null);
    setActiveRootId((prev) => (prev === id ? null : id));
    setActiveChildId(null);
  };

  const handleSecondClick = (id) => {
    soundManager.playSFX(UI_SOUNDS.MENU_CLICK.key, { volume: 0.5 });
    setInfoPage(null);
    setActiveChildId((prev) => (prev === id ? null : id));
  };

  const handleThirdClick = (onClick) => () => {
    soundManager.playSFX(UI_SOUNDS.MENU_CLICK.key, { volume: 0.52 });
    onClick();
  };

  const handleInfoBack = () => {
    soundManager.playSFX(UI_SOUNDS.MENU_CLICK.key, { volume: 0.5 });
    setInfoPage(null);
  };

  const getNodeStyle = ({ dim = false, active = false, hovered = false } = {}) => ({
    ...styles.textNode,
    opacity: dim ? 0.33 : 1,
    transform: `translateX(${active ? 8 : 0}px)`,
    textShadow: hovered
      ? "0 1px 0 rgba(255,255,255,0.99), 0 -1px 0 rgba(190,190,190,0.48), 0 0 14px rgba(255,255,255,0.45), 0 0 24px rgba(255,255,255,0.2)"
      : styles.textNode.textShadow,
  });

  return (
    <div ref={rootRef} style={{ ...styles.root, cursor: "none" }} onPointerDown={handleRootPointerDown}>
      <HomeCharacterAudio sceneReady={sceneReady} sceneStarted={sceneStarted} />
      <div
        style={{
          ...styles.background,
          transform: `scale(${zoom}) translate(${sway.x + jiggle.x}px, ${sway.y + jiggle.y}px) rotate(${sway.rot + jiggle.rot}deg)`,
          transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
        }}
      >
        {flarePosition !== null && (
          <div
            style={{
              position: "absolute",
              left: flarePosition.left,
              top: flarePosition.top,
              width: `${FLARE_SIZE_VMIN}vmin`,
              height: `${FLARE_SIZE_VMIN}vmin`,
              pointerEvents: "none",
              transform: `translate(-50%, -50%) scale(${introFlareScale}) rotate(${introFlareRot}deg)`,
              transformOrigin: "center center",
            }}
          >
            <img
              src="/img/white%20flare.png"
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center" }}
            />
          </div>
        )}
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "#fff",
          opacity: introWhiteOpacity,
          zIndex: 2,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2.6,
          pointerEvents: "none",
          opacity: showTitle && titleHovered ? TITLE_HOVER_ABERRATION_OPACITY : 0,
          transition: "opacity 220ms ease-out",
          backdropFilter: `blur(${TITLE_HOVER_ABERRATION_BLUR_PX}px)`,
          WebkitBackdropFilter: `blur(${TITLE_HOVER_ABERRATION_BLUR_PX}px)`,
          maskImage: `radial-gradient(circle at 50% 34%, transparent 0%, transparent ${TITLE_HOVER_ABERRATION_INNER}%, black ${TITLE_HOVER_ABERRATION_OUTER}%, black 100%)`,
          WebkitMaskImage: `radial-gradient(circle at 50% 34%, transparent 0%, transparent ${TITLE_HOVER_ABERRATION_INNER}%, black ${TITLE_HOVER_ABERRATION_OUTER}%, black 100%)`,
        }}
      />
      {sceneReady && !sceneStarted && (
        <button
          onClick={handleStart}
          data-ui-interactive="true"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 4,
            border: "none",
            background: "transparent",
            color: "#0a0a12",
            fontSize: "clamp(1rem, 2.5vw, 1.6rem)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            cursor: "none",
            opacity: startPromptOpacity,
            transition: `opacity ${START_PROMPT_FADE_MS}ms ease`,
          }}
        >
          Click To Start
        </button>
      )}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: `${50 * blinkCover}%`,
          background: "#000",
          zIndex: 9,
          pointerEvents: "none",
          transition: `height ${BLINK_CLOSE_MS}ms ease-in-out`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: "100%",
          height: `${50 * blinkCover}%`,
          background: "#000",
          zIndex: 9,
          pointerEvents: "none",
          transition: `height ${BLINK_CLOSE_MS}ms ease-in-out`,
        }}
      />
      {showTitle && (
        <h1
          data-ui-interactive="true"
          onMouseEnter={() => setTitleHovered(true)}
          onMouseLeave={() => setTitleHovered(false)}
          style={{
            ...styles.title,
            position: "relative",
            zIndex: 3,
            transform: `scaleY(${titleStretched ? 1 : TITLE_SQUASH_START_Y})`,
            transformOrigin: "50% 50%",
            transition: `transform ${TITLE_STRETCH_DURATION_MS}ms ease-out`,
          }}
        >
          PARAFOVEA
        </h1>
      )}
      {showTitle && (
        <div style={styles.optionsContainer}>
          {infoPage ? (
            <div style={styles.infoPanel}>
              <h3 style={styles.infoTitle}>{infoPage.title}</h3>
              <p style={styles.infoBody}>{infoPage.body}</p>
              <button style={styles.infoBack} onClick={handleInfoBack} data-ui-interactive="true">
                ← Back
              </button>
            </div>
          ) : (
            <nav
              style={{
                ...styles.tree,
                transform: `translateX(${hasSecondTier ? -34 : 0}px)`,
                transition: "transform 260ms ease",
              }}
            >
              <div style={{ ...styles.tierColumn, position: "relative", zIndex: 1 }}>
                {menuTree.map(({ id, label }) => {
                  const active = activeRootId === id;
                  const dim = activeRootId !== null && !active;
                  const hoverKey = `root:${id}`;
                  const hovered = hoveredNodeId === hoverKey;
                  return (
                    <button
                      key={id}
                      data-ui-interactive="true"
                      style={getNodeStyle({ dim, active, hovered })}
                      onClick={() => handleRootClick(id)}
                      onMouseEnter={() => setHoveredNodeId(hoverKey)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                    >
                      <span style={styles.nodeRow}>
                        <span style={styles.optionFlareNode} />
                        <span>{label}</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {hasSecondTier && (
                <div style={{ ...styles.tierColumn, position: "relative", zIndex: 1 }}>
                  {secondTier.map(({ id, label }) => {
                    const active = activeChildId === id;
                    const dim = activeChildId !== null && !active;
                    const hoverKey = `second:${activeRootId}:${id}`;
                    const hovered = hoveredNodeId === hoverKey;
                    return (
                      <button
                        key={`${activeRootId}-${id}`}
                        data-ui-interactive="true"
                        style={getNodeStyle({ dim, active, hovered })}
                        onClick={() => handleSecondClick(id)}
                        onMouseEnter={() => setHoveredNodeId(hoverKey)}
                        onMouseLeave={() => setHoveredNodeId(null)}
                      >
                        <span style={styles.nodeRow}>
                          <span style={styles.optionFlareNode} />
                          <span>{label}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {hasSecondTier && (
                <div style={{ ...styles.tierColumn, position: "relative", zIndex: 1 }}>
                  {thirdTier.map(({ id, label, onClick, accent }) => {
                    const hoverKey = `third:${activeRootId}:${activeChildId}:${id}`;
                    const hovered = hoveredNodeId === hoverKey;
                    const isDanger = accent === "danger";
                    return (
                      <button
                        key={`${activeRootId}-${activeChildId}-${id}`}
                        data-ui-interactive="true"
                        style={{
                          ...getNodeStyle({ hovered }),
                          ...(isDanger ? styles.dangerText : {}),
                        }}
                        onClick={handleThirdClick(onClick)}
                        onMouseEnter={() => setHoveredNodeId(hoverKey)}
                        onMouseLeave={() => setHoveredNodeId(null)}
                      >
                        <span style={styles.nodeRow}>
                          <span
                            style={{
                              ...styles.optionFlareNode,
                              ...(isDanger ? styles.optionFlareNodeDanger : {}),
                            }}
                          />
                          <span>{label}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </nav>
          )}
        </div>
      )}
      <div
        style={{
          position: "fixed",
          left: cursorPos.x,
          top: cursorPos.y,
          width: CURSOR_SIZE_PX,
          height: CURSOR_SIZE_PX,
          transform: `translate(-50%, -50%) scale(${showTitle ? 1 : 0}) rotate(${cursorRotDeg}deg)`,
          transformOrigin: "center center",
          opacity: showTitle ? 0.95 : 0,
          transition: `transform ${CURSOR_GROW_DURATION_MS}ms ease-out, opacity ${CURSOR_GROW_DURATION_MS}ms ease-out`,
          pointerEvents: "none",
          zIndex: 10,
        }}
      >
        <img
          src="/img/redflare.png"
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "#000",
          opacity: exitFadeOpacity,
          transition: `opacity ${START_EXIT_FADE_DURATION_MS}ms ease`,
          pointerEvents: "none",
          zIndex: 12,
        }}
      />
      <div style={styles.subtitleBar} />
    </div>
  );
}
