const socket = io();

$(document).ready(() => {
    socket.on('vm-create', (msg) => {
        Game.points = parseInt(msg);
    });
    socket.on('vm-destroy', (msg) => {
        Game.points = parseInt(msg);
    });
});