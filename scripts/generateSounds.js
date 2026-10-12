const fs = require('fs');
const path = require('path');

function createWavBuffer(sampleRate, durationSeconds, generateSample) {
  const numSamples = Math.floor(sampleRate * durationSeconds);
  const dataSize = numSamples * 2; // 16-bit mono = 2 bytes per sample
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF chunk descriptor
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt sub-chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20);  // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(1, 22);  // NumChannels (1 = Mono)
  buffer.writeUInt32LE(sampleRate, 24); // SampleRate
  buffer.writeUInt32LE(sampleRate * 2, 28); // ByteRate (sampleRate * 1 * 2)
  buffer.writeUInt16LE(2, 32);  // BlockAlign (1 * 2)
  buffer.writeUInt16LE(16, 34); // BitsPerSample (16 bits)

  // data sub-chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Write PCM samples
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let s = generateSample(t, i, numSamples);
    s = Math.max(-1, Math.min(1, s));
    const sampleInt16 = Math.floor(s < 0 ? s * 32768 : s * 32767);
    buffer.writeInt16LE(sampleInt16, offset);
    offset += 2;
  }

  return buffer;
}

// 1. Tick Sound — Crisp clock tick
function generateTickBuffer() {
  const sampleRate = 22050;
  const duration = 0.05; // 50ms
  return createWavBuffer(sampleRate, duration, (t) => {
    const decay = Math.exp(-t * 90);
    const click = Math.sin(2 * Math.PI * 1500 * t) * 0.7 +
                  Math.sin(2 * Math.PI * 3000 * t) * 0.3;
    return click * decay;
  });
}

// 2. Alarm Sound — 3-note upbeat timer chime
function generateAlarmBuffer() {
  const sampleRate = 22050;
  const duration = 1.1; // 1.1 seconds
  return createWavBuffer(sampleRate, duration, (t) => {
    let f = 523.25; // C5
    let noteT = t;
    let noteLen = 0.22;
    if (t < 0.22) {
      f = 523.25;
      noteT = t;
    } else if (t < 0.44) {
      f = 659.25; // E5
      noteT = t - 0.22;
    } else {
      f = 783.99; // G5
      noteT = t - 0.44;
      noteLen = 0.66;
    }

    const env = Math.exp(-noteT * (noteLen > 0.3 ? 4 : 8));
    const tone = Math.sin(2 * Math.PI * f * noteT) * 0.75 +
                 Math.sin(2 * Math.PI * 2 * f * noteT) * 0.25;
    return tone * env * 0.9;
  });
}

// 3. Alert Sound — Clear dual bell ring
function generateAlertBuffer() {
  const sampleRate = 22050;
  const duration = 0.85; // 850ms
  return createWavBuffer(sampleRate, duration, (t) => {
    let f = 880; // A5
    let noteT = t;
    if (t >= 0.18) {
      f = 1174.66; // D6
      noteT = t - 0.18;
    }
    const env = Math.exp(-noteT * 5.5);
    const tone = Math.sin(2 * Math.PI * f * noteT) * 0.7 +
                 Math.sin(2 * Math.PI * 2.76 * f * noteT) * 0.2 +
                 Math.sin(2 * Math.PI * 5.4 * f * noteT) * 0.1;
    return tone * env * 0.9;
  });
}

const rawDir = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res', 'raw');
if (!fs.existsSync(rawDir)) {
  fs.mkdirSync(rawDir, { recursive: true });
}

fs.writeFileSync(path.join(rawDir, 'tick.wav'), generateTickBuffer());
fs.writeFileSync(path.join(rawDir, 'alarm.wav'), generateAlarmBuffer());
fs.writeFileSync(path.join(rawDir, 'alert.wav'), generateAlertBuffer());

console.log('Successfully generated WAV sounds in android/app/src/main/res/raw/');
