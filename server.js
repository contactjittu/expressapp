const os = require('os');
const cluster = require('cluster');
const app = require('./app');
const config = require('./config/config');
const mail = require('./utils/mail');

const sendEmail = (counter) => {
  const mailOptions = {
    from: `Node API 😡<contactjittu@gmail.com>`,
    to: `contactjittu@gmail.com`,
    subject: `API Crashed ✖`,
    html: `<pre><b>Hello Jitendra,
      API is crashing ${counter} times?</b></pre>`
  };
  mail.sendEmail(mailOptions);
}

if (config.CLUSTERING) {

  if (cluster.isMaster) {
    let crashCount = 0;
    const cpus = os.cpus().length;
    console.log(`Forking for ${cpus} CPUs`);
    for (let i = 0; i < cpus; i++) {
      cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
      if (code !== 0 && !worker.exitedAfterDisconnect) {
        console.log(`Worker ${worker.id} crashed. ` + 'Starting a new worker...');
        crashCount++;
        cluster.fork();

        if (crashCount === 5) {
          console.log('Crashed 5 times, I am sending an email');
          sendEmail(crashCount);
        }
      }
    });

  } else {
    startServer();
  }

} else {
  startServer();
}

function startServer() {
  app.listen(app.get('port'), () => {
    console.log(`Server is listening on http://${os.hostname()}:${app.get('port')}`);
  });
}