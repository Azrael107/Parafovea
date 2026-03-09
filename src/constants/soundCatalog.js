export const SOUND_GROUPS = {
  MAIN_TRACKS: "main_tracks",
  VOICES: "voices",
  CHARACTER_EFFECTS: "character_effects",
  AMBIENCE: "ambience",
  UI: "ui",
};

export const HOME_SOUNDS = {
  EXPLOSION: {
    key: "home_explosion",
    path: "/sfx/space/explosion.mp3",
    group: SOUND_GROUPS.CHARACTER_EFFECTS,
    loop: false,
  },
  STEAM: {
    key: "home_steam",
    path: "/sfx/space/steam.mp3",
    group: SOUND_GROUPS.CHARACTER_EFFECTS,
    loop: false,
  },
  GASMASK_BREATH: {
    key: "home_gasmask_breath",
    path: "/sfx/space/gasmaskbreath.mp3",
    group: SOUND_GROUPS.CHARACTER_EFFECTS,
    loop: true,
  },
};

export const UI_SOUNDS = {
  MENU_CLICK: {
    key: "ui_menu_click",
    path: "/sfx/ui/menuclick.mp3",
    group: SOUND_GROUPS.UI,
    loop: false,
  },
  START_EXIT: {
    key: "ui_start_exit",
    path: "/sfx/ui/start.mp3",
    group: SOUND_GROUPS.UI,
    loop: false,
  },
};
