const { detect } = require('detect-port');
const { exec } = require('child_process');

const defaultPort = 3010;

detect(defaultPort)
  .then(availablePort => {
    if (defaultPort !== availablePort) {
      console.log(`\n🔴 Port ${defaultPort} dolu. Sunucu müsait olan Port ${availablePort} üzerinde başlatılıyor...`);
    } else {
      console.log(`\n🟢 Sunucu Port ${availablePort} üzerinde başlatılıyor...`);
    }
    const command = `next dev -p ${availablePort}`;
    const child = exec(command);
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  }); 