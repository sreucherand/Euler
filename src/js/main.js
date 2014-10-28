var webgl, gui;

$(document).ready(init);

function init(){
    webgl = new Webgl(window.innerWidth, window.innerHeight);

    gui = new dat.GUI();
    gui.close();

    $(window).on('resize', resizeHandler);
    $(document).on('mousemove', function (evt) {
        var mouse = new THREE.Vector2();
        
        mouse.x = (evt.clientX/window.innerWidth)*2-1;
        mouse.y = -(evt.clientY/window.innerHeight)*2+1;
        
        webgl.move(mouse);
    });
    
    animate();
}

function resizeHandler() {
    webgl.resize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    webgl.render();
}