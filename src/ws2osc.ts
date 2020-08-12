import * as WebSocket from "ws";
import * as Osc from "osc";

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

    ws.on('message', (message: string) => {
        let msg = JSON.parse(message);
        switch (msg.msgType) {
            case "osc":
                udpPort.send({
                    address: msg.address,
                    args: msg.args
                });
                break;
            case "roundtrip":
                let interval = Date.now() - msg.time;
                (ws as any).roundtrip = interval;
                break;
        }

    });

    ws.send(JSON.stringify({ msgType: "roundtrip", time: Date.now() }));
});



