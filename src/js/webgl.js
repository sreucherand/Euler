var Webgl = (function(){
    
    var events = {};
    var point = new THREE.Vector3(0, 0, 100);
    
    function Webgl(width, height){
        var scope = this;
        
        // Basic three.js setup
        this.scene = new THREE.Scene();
        
        this.camera = new THREE.PerspectiveCamera(50, width / height, 1, 10000);
        this.camera.position.z = 100;
        
        var promise = $.Deferred();
        this.map = new Map();
        this.map.init(function () {
            promise.resolve();
        });
        this.map.camera = this.camera;
        
        this.light = new THREE.PointLight(0xffffff, 1.5, 300);
        this.light.position.z = 600;
        
        this.container = new THREE.Object3D();
        
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(width, height);
        this.renderer.setClearColor(0x222222);
        
        this.container.add(this.map);
        this.container.add(this.light);
        
        this.scene.add(this.container);
        
        $('.three').append(this.renderer.domElement);
        
        var vignetteShader = THREE.VignetteShader;
        var vignettePass = new THREE.ShaderPass(vignetteShader);
        
        vignettePass.uniforms['offset'].value = 0.5;
        vignettePass.uniforms['darkness'].value = 2;
        vignettePass.renderToScreen = true;
        
        var renderPass = new THREE.RenderPass(this.scene, this.camera);
        
        this.composer = new THREE.EffectComposer(this.renderer, new THREE.WebGLRenderTarget(width, height, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: true }));
        this.composer.setSize(width, height);
        this.composer.addPass(renderPass);
        this.composer.addPass(vignettePass);
        
        $.when(promise).done(function () {
            this.call('load');
        }.bind(this));
    }
    
    Webgl.prototype.mouseHandler = function (evt, mouse) {
        if (!this.started) {
            return;
        }
        
        var raycaster = new THREE.Raycaster();
        var vector = new THREE.Vector3(mouse.x, mouse.y, 1).unproject(this.camera);

        raycaster.set(this.camera.position, vector.sub(this.camera.position).normalize());

        var intersects = raycaster.intersectObjects([this.map.mesh]);
        
        if (!intersects.length) {
            return;
        }
        if (evt.originalEvent.type === 'mousemove') {
            var intersection = new THREE.Vector3();
            
            point.x = intersects[0].point.x;
            point.y = intersects[0].point.y;
            
            intersection.x = intersects[0].point.x;
            intersection.y = intersects[0].point.y;
            
            this.projection(mouse);
            
            return;
        }
        if (evt.originalEvent.type === 'click') {
            var face = intersects[0].face;
            
            var centroid = new THREE.Vector3();
            
            var a = this.map.mesh.geometry.vertices[face.a];
            var b = this.map.mesh.geometry.vertices[face.b];
            var c = this.map.mesh.geometry.vertices[face.c];
            
            centroid.x = (a.x + b.x +c.x)/3;
            centroid.y = (a.y + b.y +c.y)/3;
            centroid.z = (a.z + b.z +c.z)/3;
            
            this.map.pin(centroid);
        }
    };
    
    Webgl.prototype.projection = function (mouse) {
        if (this.destination) {
            this.destination.y = mouse.x * -Math.PI/20;
        }
    };
    
    Webgl.prototype.intro = function () {
        TweenMax.to(this.container.rotation, 2, {x: -Math.PI/5, ease:Expo.easeInOut});
        TweenMax.to(this.camera.position, 2, {z: 600, ease:Expo.easeInOut, onComplete: function () {
            this.started = true;
            $('body').addClass('search');
        }.bind(this)});
    };
    
    Webgl.prototype.resize = function(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        this.composer.setSize(width, height);
    };

    Webgl.prototype.render = function(frame) {
        this.renderer.render(this.scene, this.camera);
        this.composer.render();
        this.map.update(frame);
        
        if (this.started && !this.destination) {
            this.destination = this.camera.rotation.clone();
        }
        if (this.destination && !this.map.zoom) {
            var vec = new THREE.Vector3(this.camera.rotation.x, this.camera.rotation.y, this.camera.rotation.z);
            
            vec.lerp(this.destination, 0.075);
            
            this.camera.rotation.y = vec.y;
        }
        this.light.position.lerp(point, 0.075);
    };
    
    Webgl.prototype.on = function (name, fn) {
        if (!events[name]) {
            events[name] = [];
        }
        if (typeof fn === 'function') {
            events[name].push(fn);
        }
    };
    
    Webgl.prototype.call = function (name) {
        if (!events[name]) {
            return;
        }
        
        for(var i=0; i<events[name].length; i++) {
            events[name][i]();
        }
    };

    return Webgl;

})();