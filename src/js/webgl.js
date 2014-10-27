var Webgl = (function(){

    function Webgl(width, height){
        // Basic three.js setup
        this.scene = new THREE.Scene();
        
        this.camera = new THREE.PerspectiveCamera(50, width / height, 1, 10000);
        this.camera.position.z = 500;
        
        this.light = new THREE.PointLight(0xffffff);
        this.light.position.set(50, 100, 0);
        this.scene.add(this.light);

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(width, height);
        this.renderer.setClearColor(0x2D2D2D);
        
        $('.three').append(this.renderer.domElement);
        
        this.map = new Map();
        this.scene.add(this.map);
        
        this.tbc = new THREE.TrackballControls(this.camera, this.renderer.domElement);
    }
    
    Webgl.prototype.resize = function(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    };

    Webgl.prototype.render = function() {
        this.renderer.render(this.scene, this.camera);
        this.tbc.update();
    };

    return Webgl;

})();