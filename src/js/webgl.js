var Webgl = (function(){
    
    var point = new THREE.Vector3(0, 0, 100);
    
    function Webgl(width, height){
        // Basic three.js setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(50, width / height, 1, 10000);
        this.light = new THREE.PointLight(0x333333, 1, 300);
        this.container = new THREE.Object3D();
        this.renderer = new THREE.WebGLRenderer();
        
        //this.map = new Map();
        
        this.camera.position.z = 100;
        
        this.renderer.setSize(width, height);
        this.renderer.setClearColor(0x222222);
        this.light.position.z = 500;
        //this.container.add(this.map);
        this.container.add(this.light);
        
        this.scene.add(this.container);
        
        $('.three').append(this.renderer.domElement);
        
        this.trackball = new THREE.TrackballControls(this.camera, this.renderer.domElement);
        
        
        TweenMax.to(this.camera.position, 1.5, {z: 600, ease:Expo.easeOut});
        TweenMax.to(this.container.rotation, 1.5, {x: -Math.PI / 5, ease:Expo.easeOut});
    }
    
    Webgl.prototype.mouseHandler = function (evt, mouse) {
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
            
            this.map.handlePins(intersection);
            
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
    
    Webgl.prototype.resize = function(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    };

    Webgl.prototype.render = function(frame) {
        this.renderer.render(this.scene, this.camera);
        this.trackball.update();
        this.light.position.lerp(point, 0.075);
        this.map.update(frame);
    };

    return Webgl;

})();