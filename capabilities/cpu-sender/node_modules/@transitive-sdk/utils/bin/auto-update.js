#!/usr/bin/env node

/** Script that runs the "start" script (or the one given on the command line)
of the npm package in the current directory while auto-updating it when
there is a newer version.

Example usage:
npx auto-update start 60000 .
*/

const fs = require('fs');
const {exec, spawn} = require('child_process');

const packageName = process.env.npm_package_name;
const script = process.argv[2] || 'start';
const interval = Number(process.argv[3] || 5 * 60 * 1000);

const basedir = process.cwd();
const appDir = process.argv[4] || path.resolve('../../..');
// go to upper app directory since basedir will disappear in an update
process.chdir(appDir);

let subprocess = null;

/** kill if running */
const kill = () => {
  if (subprocess) {
    console.log('killing', -subprocess.pid);
    process.kill(-subprocess.pid);
    // Note the minus: this kills the process group, not just `npm run ...`
  }
};

const restart = () => {
  console.log('(re-)starting', packageName);
  kill();
  subprocess = spawn('npm', ['run', script],
    {cwd: basedir, stdio: 'inherit', detached: true});
  // detached causes this to create a new process group that we can kill later
  subprocess.on('exit', () => console.log('(auto-updater) Subprocess stopped running'));
};

/** Remove all hidden files and directories in the given directory */
const rmHidden = (dir) => {
  fs.readdirSync(dir).forEach(name => name.startsWith('.') &&
      fs.rmSync(`${dir}/${name}`, {recursive: true, force: true})
  );
};

const checkForUpdate = () => {
  console.log('checkForUpdate');
  exec(`npm outdated --json ${packageName}`, (err, stdout, stderr) => {
    const outdated = JSON.parse(stdout);

    if (outdated[packageName]) {
      console.log('outdated', outdated[packageName]);
      if (outdated[packageName].wanted != outdated[packageName].current) {

        const scope = packageName.split('/')[0];
        rmHidden('node_modules');
        rmHidden(`node_modules/${scope}`);

        exec(`npm update ${packageName}`, (err, stdout, stderr) => {
          console.log('npm update result:', {err, stdout, stderr});
          if (!err) {
            restart();
          }
          setTimeout(checkForUpdate, interval);
        });
      } else {
        setTimeout(checkForUpdate, interval);
      }
    } else {
      setTimeout(checkForUpdate, interval);
    }
  });
};

['SIGINT', 'SIGQUIT', 'SIGTERM'].forEach(signal =>
  process.on(signal, () => {
    console.log('Caught signal', signal);
    process.exit();
  }));

process.on('exit', (code) => {
  console.log(`About to exit, code: ${code}. Stopping subprocess.`);
  kill();
});

restart();
setTimeout(checkForUpdate, interval);
