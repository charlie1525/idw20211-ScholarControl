const app = require('../server');
const server = require('http').Server(app);

const port = 3000;

server.listen(port);
console.log(`The scholar control server is running on port ${port}`);