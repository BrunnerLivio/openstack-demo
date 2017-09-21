const Server = require('../model/server');
const APP_CONFIG = require('../app.config');

class ServerRepository {
    constructor() {
        this._servers = [];
    }
    setServers(servers) {
        this._servers = servers
            .filter(server => server.name.startsWith(APP_CONFIG.INSTANCES.NAME_PREFIX))
            .map(server => new Server(server.id));
    }

    addServer(server) {
        this._servers.push(new Server(server.id));
    }

    shiftServer() {
        return this._servers.shift();
    }

    count() {
        return this._servers.length;
    }
}

module.exports = {
    ServerRepository: new ServerRepository()
};