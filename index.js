const http = require("http");
const fs = require("fs")
const path = require("path")

const memoryDb = new Map(); // est global
let id = 0; // doit être global
memoryDb.set(id++, {nom: "Alice"}) // voici comment set une nouvelle entrée.
memoryDb.set(id++, {nom: "Bob"})
memoryDb.set(id++, {nom: "Charlie"})

const server = http.createServer((req, res) => {
  try {
    console.log(req.httpVersion, req.url, req.method);
    if (req.url === "/" && req.method == "GET") {
      res.writeHead(200, { "content-type": "text/html" });
      res.write(fs.readFileSync(path.join("./public/pages/index.html"), {encoding: 'utf-8'}));
      res.end();
    } else if (req.url.startsWith("/public/") && req.method == "GET") {
        console.log(req.url)
        const fileType = req.url.split("/")[2]
        const fileName = req.url.split("/")[3]
      res.writeHead(200);
      res.write(fs.readFileSync(path.join(`./public/${fileType}/${fileName}`)));
      res.end();
    } else if (req.url == "/" && req.method != "GET") {
      res.writeHead(405, { "content-type": "text/html" });
      res.write(fs.readFileSync(path.join("./public/pages/method-not-allowed.html"), {encoding: 'utf-8'}));
      res.end();
    } else if (req.url.startsWith("/api")) {
		let data = '';
	  req.on('data', chunk => {
	    data += chunk;
	  });
	  req.on('end', () => {
	    data = data && JSON.parse(data) || null
		if (req.url == "/api/names" && req.method == "GET") {   // GET ALL
            res.writeHead(200, { "content-type": "application/json" })
            res.write(JSON.stringify(Array.from(memoryDb.entries())))
        } else if (req.url.startsWith("/api/name") && req.method == "GET") {    // GET ONE
            res.writeHead(200, { "content-type": "application/json" })
            const id = req.url.split("/")[3]
            res.write(JSON.stringify(Array.from(memoryDb.entries())[id] || []))
        } else if (req.url.startsWith("/api/names") && req.method == "POST") {    // POST
            const body = data || null
            if (body) {
              memoryDb.set(id++, data)
              res.writeHead(200, { "content-type": "application/json" })
              res.write(JSON.stringify(body))
            } else {
              res.writeHead(400, { "content-type": "application/json" })
              res.write(JSON.stringify({"error": "malformed"}))
            }
        } else if (req.url.startsWith("/api/name") && req.method == "DELETE") {    // DELETE
          res.writeHead(204, { "content-type": "application/json" })
          const id = Number(req.url.split("/")[3])
          console.log(memoryDb.delete(id))
          console.log(memoryDb)
          res.write()
        } else if (req.url.startsWith("/api/name") && req.method == "PUT") {    // PUT
          res.writeHead(200, { "content-type": "application/json" })
          const id = Number(req.url.split("/")[3])
          console.log(memoryDb.set(id, data))
          console.log(memoryDb)
          res.write(JSON.stringify(data))
        } else {
          res.writeHead(404, { "content-type": "application/json" })
          res.write(JSON.stringify({"error": "not found"}))
        }
        console.log(data)
	    res.end(); // ici termine votre route
	  });
	}
    else {
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
