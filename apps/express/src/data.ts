import WebSocket from "ws";

const ClientsMap = new Map<string, Set<{ ws: WebSocket, profileId?: string }>>();

export default ClientsMap