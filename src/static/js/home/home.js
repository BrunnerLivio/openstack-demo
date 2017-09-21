let counter = 0;
const MAX_VMS = 50;
const particleJSConfig = {
    "particles": {
        "number": {
            "value": 0,
            "density": {
                "enable": false,
                "value_area": 800
            }
        },
        "color": {
            "value": "#ffffff"
        },
        "shape": {
            "type": ["triangle", "circle", "edge"],
            "stroke": {
                "width": 3,
                "color": "rgba(255,255,255,0.5)"
            },
            "polygon": {
                "nb_sides": 5
            },
            "image": {
                "src": "img/github.svg",
                "width": 100,
                "height": 100
            }
        },
        "opacity": {
            "value": 0.0,
            "random": true,
            "anim": {
                "enable": false,
                "speed": 1,
                "opacity_min": 0.1,
                "sync": false
            }
        },
        "size": {
            "value": 25.076771369474265,
            "random": true,
            "anim": {
                "enable": false,
                "speed": 48.7246327380807,
                "size_min": 18.369080972218832,
                "sync": false
            }
        },
        "line_linked": {
            "enable": false,
            "distance": 150,
            "color": "#ffffff",
            "opacity": 0.4,
            "width": 1
        },
        "move": {
            "enable": true,
            "speed": 0.4,
            "direction": "top",
            "random": false,
            "straight": false,
            "out_mode": "out",
            "bounce": false,
            "attract": {
                "enable": false,
                "rotateX": 1282.7296486924183,
                "rotateY": 1200
            }
        }
    },
    "interactivity": {
        "detect_on": "canvas",
        "events": {
            "onhover": {
                "enable": false,
                "mode": "repulse"
            },
            "onclick": {
                "enable": false,
                "mode": "push"
            },
            "resize": true
        },
        "modes": {
            "grab": {
                "distance": 400,
                "line_linked": {
                    "opacity": 1
                }
            },
            "bubble": {
                "distance": 400,
                "size": 40,
                "duration": 2,
                "opacity": 8,
                "speed": 3
            },
            "repulse": {
                "distance": 200,
                "duration": 0.4
            },
            "push": {
                "particles_nb": 4
            },
            "remove": {
                "particles_nb": 2
            }
        }
    },
    "retina_detect": true
};
const socket = io();

function setNode(number) {
    console.log(`Setting ${number} node`);
    $('#node-numbers').text(`${number}/${MAX_VMS}`);
    if (number === MAX_VMS) {
        $('#create-vm').attr('disabled', 'disabled');
    } else {
        $('#create-vm').removeAttr('disabled');
    }
    if (number === 0) {
        $('#destroy-vm').attr('disabled', 'disabled');
    } else {
        $('#destroy-vm').removeAttr('disabled');
    }
    if (counter !== number) {
        counter = number;
        pJSDom[0].pJS.particles.number.value = counter;
        pJSDom[0].pJS.fn.particlesRefresh();
    }

}

function createVM() {
    $('#create-vm').attr('disabled', 'disabled');
    openstack.createServer().done(() => {
        if (counter !== MAX_VMS) {
            $('#create-vm').removeAttr('disabled');
        }
    });
}

function destroyVM() {
    $('#destroy-vm').attr('disabled', 'disabled');
    openstack.destroyServer().done(() => {
        if (counter !== 0) {
            $('#create-vm').removeAttr('disabled');
        }
    });
}

function initializeNodes() {
    openstack.getServers().then(data =>
        setNode(parseFloat(data.count)));
}

$(document).ready(() => {
    particlesJS('particles-js', particleJSConfig);

    $('#create-vm').click(() => createVM());
    $('#destroy-vm').click(() => destroyVM());
    initializeNodes();
    socket.on('vm-create', (msg) => setNode(parseInt(msg)));
    socket.on('vm-destroy', (msg) => setNode(parseInt(msg)));
});