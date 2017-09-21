// External dependencies
const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
const path = require('path');
const http = require('http').createServer(app);
const chalk = require('chalk');
const io = require('socket.io')(http);
const bodyParser = require('body-parser');

// Local dependencies
const ostack = require('./modules/openstack').openstack;
const APP_CONFIG = require('./app.config');
const openstack = new ostack();

// Local Constants
const PORT = process.env.OPENSTACK_DEMO_PORT || APP_CONFIG.SERVER.PORT;
const HOST = process.env.OPENSTACK_DEMO_HOST || APP_CONFIG.SERVER.HOST;
const VIEWS_DIR = path.join(__dirname, '/views');
const STATIC_DIR = path.join(__dirname, '/static');
const NODE_MODULES_DIR = path.join(__dirname, '../node_modules');

const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: '.hbs',
    layoutsDir: path.join(VIEWS_DIR, '/layouts'),
    partialsDir: path.join(VIEWS_DIR, '/partials')
});

// -- MAIN --
openstack
    .updateToken()
    .then(() => {
            console.log(chalk.green('✔') + ' Got tokens from openstack!')
            openstack
                .fetchServers()
                .then((servers) => {
                        console.log(chalk.green('✔') + ` Got in total ${chalk.blue(servers.length)} servers from openstack.`);
                        console.log(chalk.green('✔') + ` ${APP_CONFIG.INSTANCES.NAME_PREFIX}(s): ${chalk.blue(openstack.getServerCount())}`);
                    },
                    console.error);
        },
        console.error);



app.set('views', VIEWS_DIR);

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// Vendor scripts
app.use('/vendor', express.static(path.join(NODE_MODULES_DIR, 'jquery/dist/')));
app.use('/vendor', express.static(path.join(NODE_MODULES_DIR, 'materialize-css/dist/')));
app.use('/vendor', express.static(path.join(NODE_MODULES_DIR, 'reset.css/')));
app.use('/vendor', express.static(path.join(NODE_MODULES_DIR, 'particles.js/')));
app.use('/vendor', express.static(path.join(NODE_MODULES_DIR, 'socket.io-client/dist/')));

app.use('/static', express.static(STATIC_DIR));

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/alien', (req, res) => {
    res.render('alieninvasion');
});

app.get('/api/server', (req, res) => {
    res.json({
        count: openstack.getServerCount()
    });
});

app.post('/api/server', (req, res) => {
    openstack
        .createServer(parseInt(req.body.count))
        .then(() => {
            console.log(chalk.blue('✔') + ' Created server');
            io.emit('vm-create', openstack.getServerCount());
            res.sendStatus(200);
        }, (error) => {
            console.log(chalk.red('✘') + ' Failed to create server');
            console.error(error);
            res.sendStatus(403);
        });
});

app.delete('/api/server', (req, res) => {
    openstack
        .removeServer()
        .then(() => {
            console.log(chalk.blue('✔') + ' Removed server');
            io.emit('vm-destroy', openstack.getServerCount());
            res.sendStatus(200);
        }, (error) => {
            console.log(chalk.red('✘') + ' Failed to remove server');
            console.error(error);
            res.sendStatus(403);
        });
});

http.listen(PORT, HOST, () => {
    console.log(`Up and running on ` + chalk.blue(`http://${HOST}:${PORT}`));
});