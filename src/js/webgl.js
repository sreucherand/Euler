var Webgl = (function(){
    
    var point = new THREE.Vector3(0, 0, 100);
    
    function Webgl(width, height){
        // Basic three.js setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(50, width / height, 1, 10000);
        this.light = new THREE.PointLight(0x333333, 1, 300);
        this.container = new THREE.Object3D();
        this.renderer = new THREE.WebGLRenderer();
        this.trackball = new THREE.TrackballControls(this.camera, this.renderer.domElement);
        
        this.map = new Map();
        
        this.camera.position.z = 500;
        
        this.renderer.setSize(width, height);
        this.renderer.setClearColor(0x222222);
        this.light.position.z = 500;
        this.container.rotation.x = -Math.PI / 5;
        this.container.add(this.map);
        this.container.add(this.light);
        
        this.scene.add(this.container);
        
        $('.three').append(this.renderer.domElement);
    }
    
    Webgl.prototype.move = function (mouse) {
        var raycaster = new THREE.Raycaster();
        var vector = new THREE.Vector3(mouse.x, mouse.y, 1).unproject(this.camera);
        
        raycaster.set(this.camera.position, vector.sub(this.camera.position).normalize());
        
		var intersects = raycaster.intersectObjects([this.map.mesh]);
        
        if (intersects.length) {
            point.x = intersects[0].point.x;
            point.y = intersects[0].point.y;
        }
    };
    
    Webgl.prototype.resize = function(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    };

    Webgl.prototype.render = function() {
        this.renderer.render(this.scene, this.camera);
        this.trackball.update();
        this.light.position.lerp(point, 0.075);
    };

    return Webgl;

})();