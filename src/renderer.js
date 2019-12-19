const ps = require('ps-node');
const psList = require('ps-list');
const child_process = require('child_process');
let command = `ps aux`;
// child_process.exec(command, (err, stdout, stdin) => {
//   if (err) throw err;
//   console.log(stdout);
// });

(async () => {
  const data = await psList();
  console.log(data);
})()