// Registers all node-cron background jobs. Each job is defined in its own file
// under jobs/ and registered here so server.js has one place to start them all.
function registerJobs() {
  console.log('[jobs] no jobs registered yet');
}

module.exports = registerJobs;
