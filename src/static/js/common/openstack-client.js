const Openstack = function () {};

Openstack.prototype.createServer = function (number) {
    return $.ajax({
        url: '/api/server',
        method: 'POST',
        data: {
            count: number
        }
    });
};

Openstack.prototype.destroyServer = function () {
    return $.ajax({
        url: '/api/server',
        method: 'DELETE'
    });
};

Openstack.prototype.getServers = function () {
    return $.ajax({
        url: '/api/server',
        method: 'GET'
    });
};

const openstack = new Openstack();