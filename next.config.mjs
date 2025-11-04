// import { createServer } from "https";
// import { readFileSync } from "fs";
// import next from "next";
// import "./main.js"; // ✅ 서버 시작할 때 실행

// const app = next({ dev: true });
// const handle = app.getRequestHandler();

// app.prepare().then(() => {
//   const server = createServer(
//     {
//       key: readFileSync("./cert/key.pem"),
//       cert: readFileSync("./cert/cert.pem"),
//     },
//     (req, res) => handle(req, res)
//   );

//   server.listen(3000, () => {
//     console.log("HTTPS server running at https://localhost:3000");
//   });
// });
