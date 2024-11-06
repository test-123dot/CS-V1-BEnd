let http = require("http");
function requestHandler(req, res) {
    console.log("Incoming request to: " + req.url);
    res.end("Hello, world!");
}

let server = http.createServer(requestHandler);
server.listen(4000);