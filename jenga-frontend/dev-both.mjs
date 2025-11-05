import { spawn } from 'node:child_process';
import process from 'node:process';

function run(cmd, args, opts) {
  const child = spawn(cmd, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    ...opts,
  });
  return child;
}

const server = run('npm', ['run', 'start'], { cwd: 'server' });
const frontend = run('npm', ['run', 'dev'], { cwd: process.cwd() });

function shutdown(code = 0) {
  if (server && !server.killed) {
    try { server.kill(); } catch {}
  }
  if (frontend && !frontend.killed) {
    try { frontend.kill(); } catch {}
  }
  process.exit(code);
}

server.on('exit', (code) => {
  console.log(`\n[server] exited with code ${code}`);
  shutdown(code ?? 0);
});

frontend.on('exit', (code) => {
  console.log(`\n[frontend] exited with code ${code}`);
  shutdown(code ?? 0);
});

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

