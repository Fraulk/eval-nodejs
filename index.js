const http = require("http");
const fs = require("fs")
const path = require("path")

const server = http.createServer((req, res) => {
  try {
    console.log(req.httpVersion, req.url, req.method);
    if (req.url === "/" && req.method == "GET") {
      res.writeHead(200, { "content-type": "text/html" });
      res.write(fs.readFileSync(path.join("./public/pages/index.html"), {encoding: 'utf-8'}));
      res.end();
    } else if (req.url == "/" && req.method != "GET") {
      res.writeHead(405, { "content-type": "text/html" });
      res.write(fs.readFileSync(path.join("./public/pages/method-not-allowed.html"), {encoding: 'utf-8'}));
      res.end();
    } else {
      res.writeHead(404, { "content-type": "text/html" });
      res.write(fs.readFileSync(path.join("./public/pages/not-found.html"), {encoding: 'utf-8'}));
      res.end();
    }
  } catch (err) {
    console.log(err)
    res.writeHead(500, { "content-type": "text/html" });
    res.write("<h1>500 Erreur interne au serveur</h1>");
    res.end();
  }
});

server.listen(5000);
console.log("Server écoute sur le port 5000");
