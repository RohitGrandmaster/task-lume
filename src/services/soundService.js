import { Platform, Vibration } from 'react-native';
import Sound from 'react-native-sound';
import RNFS from 'react-native-fs';
import { SOUND_DATA } from '../assets/soundsData';
import { haptic } from '../utils/haptics';

// Safe category setup
try {
  if (Sound && typeof Sound.setCategory === 'function') {
    Sound.setCategory('Playback', true);
  }
} catch (e) {
  // Safe ignore if native module not ready
}

const getSoundDir = () =>
  RNFS && RNFS.DocumentDirectoryPath
    ? `${RNFS.DocumentDirectoryPath}/sounds`
    : null;

let tickSound = null;
let alarmSound = null;
let alertSound = null;
let isInitialized = false;

/**
 * Writes embedded base64 wav files to local document storage
 * so Sound can load them reliably even without a native rebuild.
 */
async function ensureSoundFiles() {
  try {
    const soundDir = getSoundDir();
    if (!soundDir || !RNFS) return;

    const dirExists = await RNFS.exists(soundDir);
    if (!dirExists) {
      await RNFS.mkdir(soundDir);
    }

    const files = [
      { name: 'tick.wav', data: SOUND_DATA?.tick },
      { name: 'alarm.wav', data: SOUND_DATA?.alarm },
      { name: 'alert.wav', data: SOUND_DATA?.alert },
    ];

    for (const f of files) {
      if (!f.data) continue;
      const fullPath = `${soundDir}/${f.name}`;
      const exists = await RNFS.exists(fullPath);
      if (!exists) {
        await RNFS.writeFile(fullPath, f.data, 'base64');
      }
    }
  } catch (err) {
    console.log('[soundService] ensureSoundFiles error:', err);
  }
}

/**
 * Loads a Sound instance with safety timeout (never hangs).
 * Handles Android res/raw identifiers (which must not have file extensions)
 * as well as iOS bundle filenames and filesystem fallback.
 */
function loadSound(fileName) {
  return new Promise(resolve => {
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve(null);
      }
    }, 3000);

    try {
      if (!Sound) {
        clearTimeout(timer);
        return resolve(null);
      }

      // Android res/raw identifiers cannot contain file extensions (e.g. 'alarm' instead of 'alarm.wav')
      const rawName = Platform.OS === 'android' ? fileName.replace(/\.[^/.]+$/, '') : fileName;

      const bundleSound = new Sound(rawName, Sound.MAIN_BUNDLE, bundleErr => {
        if (settled) return;
        if (!bundleErr) {
          settled = true;
          clearTimeout(timer);
          return resolve(bundleSound);
        }

        // Secondary attempt with original filename
        if (rawName !== fileName) {
          try {
            const secondBundle = new Sound(fileName, Sound.MAIN_BUNDLE, secErr => {
              if (settled) return;
              if (!secErr) {
                settled = true;
                clearTimeout(timer);
                return resolve(secondBundle);
              }
              tryFileFallback();
            });
            return;
          } catch (_) {
            tryFileFallback();
            return;
          }
        }

        tryFileFallback();
      });

      function tryFileFallback() {
        const soundDir = getSoundDir();
        if (!soundDir) {
          if (!settled) {
            settled = true;
            clearTimeout(timer);
            resolve(null);
          }
          return;
        }

        try {
          const filePath = `${soundDir}/${fileName}`;
          const fileSound = new Sound(filePath, '', fileErr => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            if (!fileErr) return resolve(fileSound);
            resolve(null);
          });
        } catch {
          if (!settled) {
            settled = true;
            clearTimeout(timer);
            resolve(null);
          }
        }
      }
    } catch {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        resolve(null);
      }
    }
  });
}

/**
 * Initialize all audio players safely in background
 */
export async function initSoundService() {
  try {
    await ensureSoundFiles();
    tickSound = await loadSound('tick.wav');
    alarmSound = await loadSound('alarm.wav');
    alertSound = await loadSound('alert.wav');
    isInitialized = true;
  } catch (err) {
    console.log('[soundService] init error:', err);
  }
}

/**
 * Play tick sound with subtle vibration
 */
export function playTickSound(withVibration = false) {
  try {
    if (withVibration) {
      try {
        haptic('light');
      } catch (e) {
        Vibration.vibrate(20);
      }
    }

    if (tickSound) {
      tickSound.stop(() => {
        try {
          tickSound.setVolume(0.8);
          tickSound.play(success => {
            if (!success && tickSound) {
              tickSound.reset();
            }
          });
        } catch (_) {}
      });
    }
  } catch (err) {
    console.log('[soundService] playTickSound error:', err);
  }
}

/**
 * Play alarm sound with strong vibration pattern (called when timer completes)
 */
export function playAlarmSound(withVibration = true) {
  try {
    if (withVibration) {
      Vibration.vibrate([0, 400, 200, 400, 200, 600]);
    }

    if (alarmSound) {
      alarmSound.stop(() => {
        try {
          alarmSound.setVolume(1.0);
          alarmSound.play(success => {
            if (!success && alarmSound) alarmSound.reset();
          });
        } catch (e) {}
      });
    } else {
      // Lazy load with correct name resolution
      loadSound('alarm.wav').then(s => {
        if (s) {
          alarmSound = s;
          try {
            alarmSound.setVolume(1.0);
            alarmSound.play();
          } catch (e) {}
        }
      });
    }
  } catch (err) {
    console.log('[soundService] playAlarmSound error:', err);
  }
}

/**
 * Play alert chime sound with vibration (called when todo due date / alert arrives)
 */
export function playAlertSound(withVibration = true) {
  try {
    if (withVibration) {
      Vibration.vibrate([0, 350, 200, 350]);
    }

    if (alertSound) {
      alertSound.stop(() => {
        try {
          alertSound.setVolume(1.0);
          alertSound.play(success => {
            if (!success && alertSound) alertSound.reset();
          });
        } catch (e) {}
      });
    } else {
      // Lazy load with correct name resolution
      loadSound('alert.wav').then(s => {
        if (s) {
          alertSound = s;
          try {
            alertSound.setVolume(1.0);
            alertSound.play();
          } catch (e) {}
        }
      });
    }
  } catch (err) {
    console.log('[soundService] playAlertSound error:', err);
  }
}

/**
 * Stop any playing alarm sound
 */
export function stopSound() {
  try {
    if (alarmSound) alarmSound.stop();
    if (alertSound) alertSound.stop();
    if (tickSound) tickSound.stop();
    Vibration.cancel();
  } catch (err) {
    console.log('[soundService] stopSound error:', err);
  }
}
