// Script to launch Chrome with disabled IPC flooding protection
const { exec } = require('child_process');
const os = require('os');

const platformType = os.platform();
console.log(`Detected platform: ${platformType}`);

// Determine the Chrome executable path based on the operating system
let command;
if (platformType === 'win32') {
  // Windows
  console.log('Using Windows command');
  command = `start chrome --disable-ipc-flooding-protection http://localhost:3001/test-navigation`;
} else if (platformType === 'darwin') {
  // macOS
  console.log('Using macOS command');
  command = `open -a "Google Chrome" --args --disable-ipc-flooding-protection http://localhost:3001/test-navigation`;
} else {
  // Linux and others
  console.log('Using Linux command');
  command = `google-chrome --disable-ipc-flooding-protection http://localhost:3001/test-navigation`;
}

console.log('Launching Chrome with disabled IPC flooding protection...');
console.log(`Command: ${command}`);

// Execute the command
exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
});

console.log('\nNOTE: Make sure your Next.js development server is running on port 3001');
console.log('You can start it with: npm run dev\n');
console.log('After Chrome opens, go to the test page and click "Start Test"');
console.log('Check the browser console (F12) for any throttling warnings'); 