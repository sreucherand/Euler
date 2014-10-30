var webgl, gui, frame;

$(document).ready(init);

function init(){
    webgl = new Webgl(window.innerWidth, window.innerHeight);
    
    frame = 0;

    $(window).on('resize', resizeHandler);
    $(document).on('click mousemove', mouseHandler);
    
    animate();
    
    var timeline = new TimelineMax({paused: true, delay: 1, onComplete: function () {
        $('.intro .home button').on('click', exploreHandler);
    }});
        
    webgl.on('load', function () {
        $('#loop')[0].play();
        
        TweenMax.to($('.intro .background'), 2, {opacity: 0, delay: 2.5});
        
        timeline.to($('.intro .loading'), 0.75, {opacity: 0, y: -25, ease:Expo.easeOut, force3D: true});
        timeline.to($('.intro .home h1'), 1.5, {opacity: 1, y: 0, ease:Expo.easeOut, force3D: true});
        timeline.to($('.intro .home p'), 1.5, {opacity: 1, delay: 1});
        timeline.to($('.intro .home button'), 1.5, {opacity: 1});
        timeline.play();
    });
}

function mouseHandler(evt) {
    var mouse = new THREE.Vector2();
    
    mouse.x = (evt.clientX/window.innerWidth)*2-1;
    mouse.y = -(evt.clientY/window.innerHeight)*2+1;

    webgl.mouseHandler(evt, mouse);
};

function exploreHandler(evt) {
    TweenMax.to($('.intro'), 1, {opacity: 0, ease:Expo.easeOut, onComplete: function () {
        $('.intro').remove();
        webgl.intro();
    }});
};

function resizeHandler() {
    webgl.resize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    webgl.render(frame++);
}
