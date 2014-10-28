var Map = (function(){

    function Map(){
        THREE.Object3D.call(this);
        
        var width = 1000;
        var height = 500;
        var resolution = 10;
        
        var geometry = new THREE.PlaneGeometry(width, height, width / resolution, height / resolution);
        var material = new THREE.MeshBasicMaterial({color: 0x555555, wireframe: true});
        // MeshFaceMatrerial
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.rotation.x = -Math.PI / 3;
        
        var bumpMapDeferred = new $.Deferred();
        var specularMapDeferred = new $.Deferred();
        
        var textureLoader = new THREE.TextureLoader();
        
        textureLoader.load('public/img/bump_map.jpg', function (data) {
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');
            
            canvas.width = width;
            canvas.height = height;
            
            context.drawImage(data.image, 0, 0, width, height);
            
            bumpMapDeferred.resolve(context);
        });
        textureLoader.load('public/img/specular_map.jpg', function (data) {
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');
            
            canvas.width = width;
            canvas.height = height;
            
            context.drawImage(data.image, 0, 0, width, height);
            
            specularMapDeferred.resolve(context);
        });
        
        $.when(bumpMapDeferred, specularMapDeferred).done(function (bumpMap, specularMap) {
            var column = 0;
            var line = 0;
            
            for (var i=0; i < this.mesh.geometry.vertices.length; i++) {
                vertice = this.mesh.geometry.vertices[i];
                
                data = bumpMap.getImageData(column * resolution, line * resolution, 1, 1).data;
                color = new THREE.Color(data[0]/255, data[1]/255, data[2]/255);
                color = color.getHSL();
                
                altitude = color.l;
                
                data = specularMap.getImageData(column * resolution, line * resolution, 1, 1).data;
                color = new THREE.Color(data[0]/255, data[1]/255, data[2]/255);
                color = color.getHSL();
                
                specular = color.l;
                
                if (specular < 0.5 && Math.abs(vertice.x) !== width/2 && Math.abs(vertice.y) !== height/2) {
                    vertice.z += altitude * 50;
                    vertice.x += Math.random() * 10;
                    vertice.y += Math.random() * 10;
                } else {
                    vertice.z = 0;
                }
                
                if (++column === (width / resolution) + 1) {
                    column = 0;
                    line++;
                }
            }
            
            this.mesh.geometry.verticesNeedUpdate = true;
            
            this.mesh.geometry.normalsNeedUpdate = true;
            for (var i=0; i < this.mesh.geometry.faces.length; i++) {
                console.log(this.mesh.geometry.faces[i]);
            }
            this.add(this.mesh);
            
        }.bind(this));
    }

    Map.prototype = new THREE.Object3D;
    Map.prototype.constructor = Map;

    return Map;
})();