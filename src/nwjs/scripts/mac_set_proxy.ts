import * as path from 'path';

const sudoPrompt = require('sudo-prompt');
const spawn = require('child_process').spawn;
const child_exec = require('child_process').exec;

// start the process
export function startSettingProcess(port: number, args: any) {
    installProxyConfHelperIfNeeded().then(() => {
        // spawnChildProcessWithTrace('ss-local-mac', args);
        spawnChildProcessWithTrace('proxy_conf_helper', ['-m', 'global', '--port', port.toString()]);
    });
}

export function stopProxy() {
    let proxyConfHelperPath = getBinaryPath('proxy_conf_helper');  
    const proxyConfHelperProcess = spawn(proxyConfHelperPath, ['-m', 'off']);
}

function spawnChildProcessWithTrace(fileName: string, args: string[]) {
    // TODO: it's confusing where file is the short filename vs full path
    let fullPath = getBinaryPath(fileName);
    const process = spawn(getBinaryPath(fileName), args);
    process.stdout.on('data', (data: Buffer) => {
      console.log(`${fileName}: stdout: ${data}`);
    });
    process.stderr.on('data', (data: Buffer) => {
      console.error(`${fileName}: stderr: ${data}`);
    });
    process.on('close', (code: Buffer) => {
      console.log(`${fileName}: exited with code ${code}`);
    });
  }

function getBinaryPath(file: string): string {
return path.join(__dirname, 'binaries/' + file);
}

function runUnixCommand(command: string, args: string[], env: Object): Promise<string> {
    // TODO: use exec or execFile instead of spawn, since exec waits for it to finish...
    // TODO: this should rely on exit code, not trace!!!!!  otherwise if there is a lot of trace this will break
    return new Promise((fulfill, reject) => {
      const process = spawn(command, args, {env: env});
      process.stdout.on('data', (data: any) => {
        // Remove trailing \n
        fulfill(data.toString().replace(/\n$/, ''));
      });
      process.stderr.on('data', (data: any) => {
        reject(data);
      });
    });
}

function installProxyConfHelperIfNeeded() :Promise<void> {
    const proxyConfHelperPath = getBinaryPath('proxy_conf_helper');
    return new Promise<void>((fulfill, reject) => {
      runUnixCommand(
          getBinaryPath('is_proxy_conf_helper_installed.sh'),
          [],
          {PROXY_CONF_HELPER_PATH: proxyConfHelperPath})
      .then((response: string) => {
        if (response == 'true') {
          // already installed
          fulfill();
          return;
        }
        // Need to install using sudo.
        let options = {name: 'uProxy Server Manager'};
        let proxyConfHelperInstallerPath = getBinaryPath('proxy_conf_helper_install.sh');
        let proxyConfHelperInstallerCommand =
            `PROXY_CONF_HELPER_PATH="${proxyConfHelperPath}" "${proxyConfHelperInstallerPath}"`;
        sudoPrompt.exec(proxyConfHelperInstallerCommand, options, (err: any, stdout: any, stderr: any) => {
          if (err) {
            reject(err);
          } else {
            fulfill();
          }
        });
      }).catch((e: Error) => {
        // TODO: handle error
      });
    });
  }