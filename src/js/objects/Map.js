var Map = (function(){

    function Map(){
        THREE.Object3D.call(this);
        
        var width = 1000;
        var height = 500;
        var resolution = 10;
        
        var geometry = new THREE.PlaneGeometry(width, height, width / resolution, height / resolution);
        var material = new THREE.MeshBasicMaterial({color: 0x555555, wireframe: true});
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.rotation.x = -Math.PI / 3;
        
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        
        var textureLoader = new THREE.TextureLoader();
        
        canvas.width = width;
        canvas.height = height;
        
        var scope = this;
        
        textureLoader.load('public/img/bump_map.jpg', function (res) {
            context.drawImage(res.image, 0, 0, width, height);
            
            var column = 0;
            var line = 0;
            
            for (var i=0; i < this.mesh.geometry.vertices.length; i++) {
                data = context.getImageData(column * resolution, line * resolution, 1, 1).data;
                color = new THREE.Color(data[0]/255, data[1]/255, data[2]/255);
                color = color.getHSL();
                vertice = scope.mesh.geometry.vertices[i];
                
                if (Math.abs(vertice.x) !== width/2 && Math.abs(vertice.y) !== height/2) {
                    vertice.x += Math.random() * 10;
                    vertice.y += Math.random() * 10;
                    vertice.z += color.l * 50;
                }
                
                column++;
                if (column ===  (width / resolution) + 1) {
                    column = 0;
                    line++;
                }
            }
            
            scope.mesh.geometry.verticesNeedUpdate = true;
        }.bind(this));
        
        this.add(this.mesh);
    }

    Map.prototype = new THREE.Object3D;
    Map.prototype.constructor = Map;

    return Map;
})();