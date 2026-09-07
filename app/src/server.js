const http = require("http");
const { buildMessage } = require("./app");

const port = process.env.PORT || 8080;
const host = process.env.HOST || "0.0.0.0";

const server = http.createServer((request, response) => {
    if (request.url === "/health") {
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ status: "ok" }));
        return;
    }

    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ message: buildMessage() }));
});

server.listen(port, host, () => {
    console.log(`Server listening on ${host}:${port}`);
});