var webgl, gui, frame;

$(document).ready(init);

function init(){
    webgl = new Webgl(window.innerWidth, window.innerHeight);
    
//
//    gui = new dat.GUI();
//    gui.close();
//    
//    frame = 0;
//
//    $(window).on('resize', resizeHandler);
//    $(document).on('mousemove', function (evt) {
//        var mouse = new THREE.Vector2();
//        
//        mouse.x = (evt.clientX/window.innerWidth)*2-1;
//        mouse.y = -(evt.clientY/window.innerHeight)*2+1;
//        
//        webgl.mouseHandler(evt, mouse);
//    });
//    $(document).on('click', function (evt) {
//        var mouse = new THREE.Vector2();
//        
//        mouse.x = (evt.clientX/window.innerWidth)*2-1;
//        mouse.y = -(evt.clientY/window.innerHeight)*2+1;
//        
//        webgl.mouseHandler(evt, mouse);
//    });
//    
//    
//    animate();
}

function resizeHandler() {
    webgl.resize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    webgl.render(frame++);
}

function removeAccents(string) {
    var string = string.split('');
    var stringOut = new Array();
    var accents = 'ÀÁÂÃÄÅàáâãäåÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëðÇçÐÌÍÎÏìíîïÙÚÛÜùúûüÑñŠšŸÿýŽž';
    var accentsOut = "AAAAAAaaaaaaOOOOOOOooooooEEEEeeeeeCcDIIIIiiiiUUUUuuuuNnSsYyyZz";
    for (var y = 0; y < string.length; y++) {
        if (accents.indexOf(string[y]) != -1) {
            stringOut[y] = accentsOut.substr(accents.indexOf(string[y]), 1);
        } else
            stringOut[y] = string[y];
    }
    stringOut = stringOut.join('');
    
    return stringOut;
}
