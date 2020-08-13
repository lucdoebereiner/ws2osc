"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocket = __importStar(require("ws"));
const Osc = __importStar(require("osc"));
const udpPort = new Osc.UDPPort({
    // This is the port we're listening on.
    localAddress: "127.0.0.1",
    localPort: 57121,
    // This is where sclang is listening for OSC messages.
    remoteAddress: "127.0.0.1",
    remotePort: 57120,
    metadata: true
});
// Open the socket.
udpPort.open();
const wss = new WebSocket.Server({ port: 8080 });
wss.on('connection', function connection(ws) {
    ws.on('message', (message) => {
        let msg = JSON.parse(message);
        switch (msg.msgType) {
            case "id":
                ws.klangraumId = msg.id;
                ws.klangraumChannel = msg.channel;
                //                console.log('id msg', msg, (ws as any).klangraumId);
                break;
            case "osc":
                udpPort.send({
                    address: msg.address,
                    args: msg.args
                });
                break;
            case "roundtrip":
                let interval = Date.now() - msg.time;
                ws.roundtrip = interval;
                break;
        }
    });
    ws.send(JSON.stringify({ msgType: "roundtrip", time: Date.now() }));
});
udpPort.on("message", (oscMsg) => {
    wss.clients.forEach((client) => client.send(JSON.stringify({ msgType: "osc", msg: oscMsg })));
    console.log("An OSC message just arrived!", oscMsg);
});
setInterval(() => {
    let clientsArray = Array.from(wss.clients);
    let argsArray = clientsArray.map((cl) => {
        return [
            { type: "f", value: cl.klangraumId },
            { type: "f", value: cl.klangraumChannel },
            { type: "f", value: cl.roundtrip }
        ];
    });
    udpPort.send({
        address: "/clients",
        args: argsArray
    });
}, 5000);
//# sourceMappingURL=ws2osc.js.map