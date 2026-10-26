#!/usr/bin/env node
/**
 * Pulsar Studio — phone link helper.
 *
 * Prints every URL the studio is reachable on plus a scannable QR code,
 * so you can open it on an iPhone/iPad on the same Wi-Fi without typing.
 *
 *   npm run link
 *   PORT=5000 npm run link
 */
import os from 'node:os';
import QRCode from 'qrcode';

const PORT = Number(process.env.PORT || 4000);

const PRIVATE_RANGES = [/^10\./, /^192\.168\./, /^172\.(1[6-9]|2\d|3[01])\./, /^169\.254\./];

function lanAddresses() {
  const result = [];
  for (const [name, entries] of Object.entries(os.networkInterfaces())) {
    for (const entry of entries || []) {
      if (entry.family !== 'IPv4' && entry.family !== 4) continue;
      if (entry.internal || entry.address.startsWith('127.')) continue;
      result.push({
        name,
        address: entry.address,
        url: `http://${entry.address}:${PORT}`,
        private: PRIVATE_RANGES.some((rx) => rx.test(entry.address)),
        preferred: /^(wlan|wl|wlp|enp|eno|eth)/.test(name),
      });
    }
  }
  return result.sort((a, b) => Number(b.preferred) - Number(a.preferred) || Number(b.private) - Number(a.private));
}

const lan = lanAddresses();
const local = `http://localhost:${PORT}`;

console.log('');
console.log('  \x1b[38;5;191mPULSAR STUDIO\x1b[0m · open on your phone');
console.log(`  desktop   ${local}`);
if (lan.length) {
  console.log(`  iPhone    \x1b[1m${lan[0].url}\x1b[0m   (${lan[0].name})`);
  for (const entry of lan.slice(1)) console.log(`            ${entry.url}   (${entry.name})`);
} else {
  console.log('  iPhone    no LAN address found — are you connected to Wi-Fi?');
}
console.log('');
console.log('  Same Wi-Fi required. If the phone cannot connect:');
console.log(`    sudo ufw allow ${PORT}/tcp        # Ubuntu firewall`);
console.log('');
console.log('  Scan with the iPhone camera:');
console.log('');

const target = lan[0]?.url || local;
QRCode.toString(target, { type: 'terminal', small: true, errorCorrectionLevel: 'M' })
  .then((qr) => {
    console.log(qr);
    console.log(`  ${target}`);
    console.log('');
    console.log('  Tip: Safari → Share → "Add to Home Screen" turns Pulsar into an app.');
    console.log('');
  })
  .catch((err) => {
    console.error('Could not render QR code:', err.message);
    process.exitCode = 1;
  });
