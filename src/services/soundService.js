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
let focusSound = null;
let activeSound = null;
let stopTimer = null;
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
      { name: 'alert.wav', data: SOUND_DATA?.alert },
      { name: 'alarm.wav', data: SOUND_DATA?.alarm },
      { name: 'focus.wav', data: SOUND_DATA?.focus },
    ];

    for (const f of files) {
      if (!f.data) continue;
      const fullPath = `${soundDir}/${f.name}`;
      const exists = await RNFS.exists(fullPath);
      let shouldWrite = !exists;
      if (exists) {
        try {
          const stat = await RNFS.stat(fullPath);
          const expectedBytes = Math.floor((f.data.length * 3) / 4);
          if (Math.abs(Number(stat.size) - expectedBytes) > 200) {
            shouldWrite = true;
          }
        } catch (_) {
          shouldWrite = true;
        }
      }
      if (shouldWrite) {
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
  if (isInitialized) return;
  try {
    await ensureSoundFiles();
    const [tick, alert, alarm, focus] = await Promise.all([
      loadSound('tick.wav'),
      loadSound('alert.wav'),
      loadSound('alarm.wav'),
      loadSound('focus.wav'),
    ]);
    tickSound = tick;
    alertSound = alert;
    alarmSound = alarm;
    focusSound = focus;
    isInitialized = true;
  } catch (err) {
    console.log('[soundService] init error:', err);
  }
}

/**
 * Play tick sound with subtle vibration (tap/toggle feedback)
 * Duration: 0.05s
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
          tickSound.setCurrentTime(0);
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

export const AUDIO_PRIORITY = {
  FOCUS: 3,
  ALARM: 2,
  ALERT: 1,
  TICK: 0,
};

let currentAudioPriority = -1;
let currentAudioSource = null;

export function getCurrentSoundSource() {
  return currentAudioSource;
}

export function isSoundActive() {
  return activeSound !== null || currentAudioPriority > -1;
}

/**
 * Checks if a Pomodoro focus timer and active Todo task timers are running simultaneously.
 * Helps prevent clashing notifications and audio overlap.
 */
export function checkTimerConflict({ isPomodoroRunning, activeTaskTimers }) {
  const hasTaskTimers =
    Array.isArray(activeTaskTimers) &&
    activeTaskTimers.some(
      t => t.timerEndAt && new Date(t.timerEndAt).getTime() > Date.now(),
    );

  return {
    hasConflict: Boolean(isPomodoroRunning && hasTaskTimers),
    isPomodoroRunning: Boolean(isPomodoroRunning),
    hasTaskTimers,
  };
}

/**
 * Play alert chime sound with gentle double vibration
 * Used for: Task Due Date Reminders & Alerts
 * Sound: 0.85s crisp modern notification ping
 * Duration: ~1.0s single crisp playback
 */
export function playAlertSound(withVibration = true, source = 'reminder') {
  try {
    if (currentAudioPriority > AUDIO_PRIORITY.ALERT) {
      // Higher priority audio (like focus alarm or timer alarm) is actively playing
      return;
    }

    stopSound();
    currentAudioPriority = AUDIO_PRIORITY.ALERT;
    currentAudioSource = source;

    if (withVibration) {
      // Gentle clean double pulse: ~500ms total
      Vibration.vibrate([0, 200, 100, 200]);
    }

    const startPlaying = s => {
      try {
        activeSound = s;
        // Safety timeout to ensure no hanging sound
        stopTimer = setTimeout(() => {
          stopSound();
        }, 1500);

        s.stop(() => {
          try {
            s.setCurrentTime(0);
            s.setVolume(1.0);
            s.setNumberOfLoops(0);
            s.play(success => {
              if (!success && s) {
                s.reset();
                // Vibration fallback in case audio track stalled
                Vibration.vibrate([0, 250, 100, 250]);
              }
            });
          } catch (_) {}
        });
      } catch (_) {
        try {
          s.setCurrentTime(0);
          s.setVolume(1.0);
          s.play();
        } catch (e) {
          Vibration.vibrate([0, 250, 100, 250]);
        }
      }
    };

    if (alertSound) {
      startPlaying(alertSound);
    } else {
      loadSound('alert.wav').then(s => {
        if (s) {
          alertSound = s;
          startPlaying(alertSound);
        } else {
          // Fallback: If audio load completely failed, trigger tactile notification
          Vibration.vibrate([0, 250, 100, 250]);
        }
      });
    }
  } catch (err) {
    console.log('[soundService] playAlertSound error:', err);
    Vibration.vibrate([0, 250, 100, 250]);
  }
}

/**
 * Play alarm sound with rhythmic timer vibration pattern
 * Used for: Todo Item Timer Completed & Break Completed
 * Sound: 1.1s classic ringing chime
 * Duration: 3.5s (3 chime cycles) with auto-stop
 */
export function playAlarmSound(withVibration = true, durationMs = 3500, source = 'todo_timer') {
  try {
    if (currentAudioPriority > AUDIO_PRIORITY.ALARM) {
      return;
    }

    stopSound();
    currentAudioPriority = AUDIO_PRIORITY.ALARM;
    currentAudioSource = source;

    if (withVibration) {
      // Rhythmic timer pattern: ~2.5s total
      Vibration.vibrate([0, 400, 200, 400, 200, 400, 200, 400]);
    }

    const startPlaying = s => {
      try {
        activeSound = s;
        // Explicit auto-stop timer
        stopTimer = setTimeout(() => {
          stopSound();
        }, durationMs);

        s.stop(() => {
          try {
            s.setCurrentTime(0);
            s.setVolume(1.0);
            // Loop until auto-stop timer triggers
            s.setNumberOfLoops(-1);
            s.play(success => {
              if (!success && s) {
                s.reset();
                // Fallback to alert sound if alarm audio playback fails
                if (alertSound) alertSound.play();
              }
            });
          } catch (_) {}
        });
      } catch (_) {
        try {
          s.setCurrentTime(0);
          s.setVolume(1.0);
          s.play();
        } catch (e) {
          if (alertSound) alertSound.play();
        }
      }
    };

    if (alarmSound) {
      startPlaying(alarmSound);
    } else {
      loadSound('alarm.wav').then(s => {
        if (s) {
          alarmSound = s;
          startPlaying(alarmSound);
        } else if (alertSound) {
          // Graceful fallback to alert sound if alarm.wav failed to load
          startPlaying(alertSound);
        } else {
          // Sustained vibration fallback
          Vibration.vibrate([0, 500, 200, 500, 200, 500]);
        }
      });
    }
  } catch (err) {
    console.log('[soundService] playAlarmSound error:', err);
    Vibration.vibrate([0, 500, 200, 500, 200, 500]);
  }
}

/**
 * Play focus completed sound with celebratory vibration pattern
 * Used for: Pomodoro Focus / Deep Work session completion
 * Sound: 5.00s melodic celebration alarm
 * Duration: Exactly 5.00s with auto-stop
 */
export function playFocusSound(withVibration = true, durationMs = 5000, source = 'pomodoro') {
  try {
    stopSound();
    currentAudioPriority = AUDIO_PRIORITY.FOCUS;
    currentAudioSource = source;

    if (withVibration) {
      // 5-second rhythmic celebration pattern
      Vibration.vibrate([0, 500, 250, 500, 250, 500, 250, 500, 250, 500, 250, 500]);
    }

    const startPlaying = s => {
      try {
        activeSound = s;
        // Explicit 5-second auto-stop timer
        stopTimer = setTimeout(() => {
          stopSound();
        }, durationMs);

        s.stop(() => {
          try {
            s.setCurrentTime(0);
            s.setVolume(1.0);
            s.setNumberOfLoops(0);
            s.play(success => {
              if (!success && s) {
                s.reset();
                if (alarmSound) alarmSound.play();
              }
            });
          } catch (_) {}
        });
      } catch (_) {
        try {
          s.setCurrentTime(0);
          s.setVolume(1.0);
          s.play();
        } catch (e) {
          if (alarmSound) alarmSound.play();
        }
      }
    };

    if (focusSound) {
      startPlaying(focusSound);
    } else {
      loadSound('focus.wav').then(s => {
        if (s) {
          focusSound = s;
          startPlaying(focusSound);
        } else if (alarmSound) {
          // Graceful fallback to alarm sound if focus.wav failed to load
          startPlaying(alarmSound);
        } else {
          Vibration.vibrate([0, 600, 200, 600, 200, 600]);
        }
      });
    }
  } catch (err) {
    console.log('[soundService] playFocusSound error:', err);
    Vibration.vibrate([0, 600, 200, 600, 200, 600]);
  }
}

/**
 * Immediately stop any playing sound and cancel vibration
 */
export function stopSound() {
  try {
    currentAudioPriority = -1;
    currentAudioSource = null;

    if (stopTimer) {
      clearTimeout(stopTimer);
      stopTimer = null;
    }
    if (activeSound) {
      try {
        activeSound.stop();
        activeSound.setCurrentTime(0);
      } catch (_) {}
      activeSound = null;
    }
    if (alarmSound) {
      try {
        alarmSound.stop();
        alarmSound.setCurrentTime(0);
      } catch (_) {}
    }
    if (focusSound) {
      try {
        focusSound.stop();
        focusSound.setCurrentTime(0);
      } catch (_) {}
    }
    if (alertSound) {
      try {
        alertSound.stop();
        alertSound.setCurrentTime(0);
      } catch (_) {}
    }
    if (tickSound) {
      try {
        tickSound.stop();
        tickSound.setCurrentTime(0);
      } catch (_) {}
    }
    Vibration.cancel();
  } catch (err) {
    console.log('[soundService] stopSound error:', err);
  }
}
