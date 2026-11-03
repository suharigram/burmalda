import { spawn } from 'node:child_process';

const processes = [
  spawn(process.execPath, ['--watch', 'server/index.mjs'], { stdio: 'inherit', env: { ...process.env, PORT: '4173' } }),
  spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '0.0.0.0'], { stdio: 'inherit', env: process.env }),
];

const stop = () => { processes.forEach((child) => child.kill('SIGTERM')); };
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
processes.forEach((child) => child.on('exit', (code) => { if (code && code !== 0) { stop(); process.exitCode = code; } }));
