// These are default variables. The may be ovewritten,
// if environment variables are set.

module.exports = {
    // Example: 7924fa9c7fc34b8b8bd3d03954943dfd
    PROJECT_ID: '',
    // Example: http://os-suse.mysite.com:5000/v3
    KEYSTONE_SERVER: '',
    // Example: http://os-suse.mysite.com:8774/v2
    NOVA_SERVER: '',
    INSTANCES: {
        NAME_PREFIX: 'MINION',
        // Example: a0ef0443-f0f6-49a8-b7d9-81dca8713993
        FLAVOR_ID: 1,
        // Example: 10e30443-f0f6-49a8-b7d9-81aca87139f1
        IMAGE_ID: '',
        // Example: 2c9fbee0-59ac-47a7-8103-c993b62a4e41
        NETWORK_ID: '',
        // You must configure in the dashboard the given MAX + 20.
        // Example: If you set in this file the MAX 50, configure dashboard 
        // to 70
        MAX: 50,
    },
    // Local webserver
    SERVER: {
        PORT: 8080,
        HOST: '0.0.0.0'
    },
    AUTHENTICATION: {
        USERNAME: '',
        PASSWORD: ''
    }
};