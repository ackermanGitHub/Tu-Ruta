import WebSocket from "ws";
import { httpServer } from "./app";
import ClientsMap from "./data";
import { IncomingMessage } from "http";

const wsServer = new WebSocket.Server({ noServer: true })

/* const streamSuscription = setInterval(async () => {

}, 3000) */

wsServer.on('connection', handleNewConnection);

httpServer.on('upgrade', (req, socket, head) => {
    wsServer.handleUpgrade(req, socket, head, (ws) => {
        wsServer.emit('connection', ws, req);
    });
});

function handleNewConnection(ws: WebSocket, request: IncomingMessage) {
    const protocol = request.headers['sec-websocket-protocol'];

    if (!protocol) {
        ws.close(undefined, "No protocol specified");
        console.log('No protocol specified', protocol);
        return;
    }

    if (!protocol.includes('map-client') && !protocol.includes('map-worker')) {
        ws.close(undefined, "Protocol not Suported");
        console.log('Protocol not Suported', protocol);
        return;
    }

    console.log(`New connection with protocol: ${protocol}`);

    if (protocol.includes('map-client-')) {
        let clientsSet = ClientsMap.get('map-client');
        if (!clientsSet) {
            clientsSet = new Set<{ ws: WebSocket, profileId: string }>();
            ClientsMap.set('map-client', clientsSet);
        }
        clientsSet.add({ ws, profileId: protocol.replace('map-client-', '') });
    }

    if (protocol.includes('map-worker-')) {
        let clientsSet = ClientsMap.get('map-worker');
        if (!clientsSet) {
            clientsSet = new Set<{ ws: WebSocket, profileId: string }>();
            ClientsMap.set('map-worker', clientsSet);
        }
        clientsSet.add({ ws, profileId: protocol.replace('map-worker-', '') });
    }

    ws.on('message', (message) => {

        if (protocol.includes('map-client-')) {
            // const location: { coords: { accuracy: number, altitude: number, altitudeAccuracy: number, heading: number, latitude: number, longitude: number, speed: number }, mocked: boolean, timestamp: number, userId: string } = JSON.parse(message.toString())
        } else if (protocol.includes('map-worker-')) {
            // const location: { coords: { accuracy: number, altitude: number, altitudeAccuracy: number, heading: number, latitude: number, longitude: number, speed: number }, mocked: boolean, timestamp: number, userId: string } = JSON.parse(message.toString())
            // broadcastToClientsByProtocol('map-client', recieved);
        }

    });

    ws.on('error', (error) => {
        console.error(`WebSocket error: ${error}`);
        // Remove the client from the list of connected clients
        const clientsSet = ClientsMap.get(protocol);
        if (clientsSet) {
            clientsSet.delete({ ws });
            if (clientsSet.size === 0) {
                ClientsMap.delete(protocol);
            }
        }
    });

    ws.on('close', () => {
        // Remove the client from the list of connected clients
        const clientsSet = ClientsMap.get(protocol);
        if (clientsSet) {
            clientsSet.delete({ ws });
            if (clientsSet.size === 0) {
                ClientsMap.delete(protocol);
            }
        }
    });
}

function broadcastToClientsByProtocol(protocol: string, message: string) {
    const clientsSet = ClientsMap.get(protocol);
    if (clientsSet) {
        clientsSet.forEach((client) => {
            if (client.ws.readyState === WebSocket.OPEN) {
                client.ws.send(message);
            }
        });
    } else {
        console.log(`No clients connected with protocol: ${protocol}`);
    }
}