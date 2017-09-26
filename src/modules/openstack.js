const OSWrap = require('openstack-wrapper');
const Moniker = require('moniker');
const APP_CONFIG = require('../app.config');
const ServerRepository = require('../repositories/server-repository').ServerRepository;
const KEYSTONE_SERVER = process.env.KEYSTONE_SERVER || APP_CONFIG.KEYSTONE_SERVER;
const NOVA_SERVER = process.env.NOVA_SERVER || APP_CONFIG.NOVA_SERVER;

class Openstack {
    constructor() {
        this.keystone = new OSWrap.Keystone(KEYSTONE_SERVER);
        this.serverRepository = ServerRepository;
    }

    _getToken() {
        return new Promise((resolve, reject) => {
            this.keystone
                .getToken(APP_CONFIG.AUTHENTICATION.USERNAME,
                APP_CONFIG.AUTHENTICATION.PASSWORD,
                (error, token) => {
                    if (error) {
                        reject(error);
                    } else {
                        this.general_token = token;
                        resolve(token);
                    }
                });
        });
    }
    _getProjectTokenById() {
        return new Promise((resolve, reject) => {
            this.keystone
                .getProjectTokenById(this.general_token.token,
                APP_CONFIG.PROJECT_ID,
                (error, token) => {
                    if (error) {
                        reject(error);
                    } else {
                        this.project_token = token;
                        this.nova = new OSWrap.Nova(NOVA_SERVER, token.token);
                        resolve(token);
                    }
                });
        });
    }

    hasTokenExpired() {
        return new Date(this.general_token.expires_at) < new Date();
    }

    updateToken() {
        return new Promise((resolve, reject) => {
            this._getToken()
                .then(() => {
                    this._getProjectTokenById()
                        .then(() => {
                            resolve();
                        }, reject);
                }, reject);
        });
    }
    async fetchServers() {
        if (this.hasTokenExpired()) {
            await this.updateToken();
        }
        return new Promise((resolve, reject) => {
            this.nova.listServers((error, servers) => {
                if (error) {
                    reject(error);
                } else {
                    this.serverRepository.setServers(servers);
                    resolve(servers);
                }
            });
        });
    }

    getServerCount() {
        return this.serverRepository.count();
    }

    _createServer() {
        return new Promise((resolve, reject) => {
            this.nova.createServer({
                server: {
                    name: `${APP_CONFIG.INSTANCES.NAME_PREFIX}_${Moniker.generator([Moniker.noun]).choose().toUpperCase()}`,
                    flavorRef: APP_CONFIG.INSTANCES.FLAVOR_ID,
                    imageRef: APP_CONFIG.INSTANCES.IMAGE_ID,
                    networks: [{
                        uuid: APP_CONFIG.INSTANCES.NETWORK_ID
                    }]
                }
            }, (error, server) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(server);
                }
            });
        });
    }

    async createServer(number) {
        if (this.hasTokenExpired()) {
            await this.updateToken();
        }
        return new Promise((resolve, reject) => {
            let vmsToCreate = number || 1;
            if (vmsToCreate + this.getServerCount() > APP_CONFIG.INSTANCES.MAX) {
                vmsToCreate = APP_CONFIG.INSTANCES.MAX - this.getServerCount();
            }

            if (vmsToCreate <= 0) {
                reject('Limit reached');
                return;
            }
            let promises = [];
            for (let i = 0; i < vmsToCreate; i++) {
                promises.push(this._createServer());
            }

            Promise
                .all(promises)
                .then((servers) => {
                    servers.forEach(server => {
                        this.serverRepository.addServer(server);
                    });
                    resolve();
                }, (error) => {
                    reject(error);
                });

        });
    }

    async removeServer() {
        if (this.hasTokenExpired()) {
            await this.updateToken();
        }
        return new Promise((resolve, reject) => {
            let serverToDelete = this.serverRepository.shiftServer();
            if (!serverToDelete) {
                reject('No Servers left!');
                return;
            }
            this.nova.removeServer(serverToDelete.id, (error, data) => {
                if (error) {
                    this.serverRepository.addServer(serverToDelete);
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }
}


module.exports = {
    openstack: Openstack
};