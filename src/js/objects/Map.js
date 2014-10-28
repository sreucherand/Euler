var Map = (function(){

    function Map(){
        THREE.Object3D.call(this);
        
        var width = 1000;
        var height = 500;
        var resolution = 10;
        
        var geometry = new THREE.PlaneGeometry(width, height, width / resolution, height / resolution);
        var material = new THREE.MeshFaceMaterial([new THREE.MeshPhongMaterial({emissive: 0x222222, wireframe: true, shininess: 100}), new THREE.MeshNormalMaterial({transparent: true, opacity: 0})])
        
        this.mesh = new THREE.Mesh(geometry, material);
        
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
            
            this.vertices = [];
            this.faces = [];
            
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
                
                if (Math.abs(vertice.x) !== width/2 && Math.abs(vertice.y) !== height/2) {
                    vertice.x += Math.random() * 10;
                    vertice.y += Math.random() * 10;
                    
                    if (specular < 0.5) {
                        vertice.z += altitude * 50;
                        
                        this.vertices.push(i);
                    } else {
                        vertice.z = 0;
                    }
                }
                if (++column === (width / resolution) + 1) {
                    column = 0;
                    line++;
                }
            }
            
            this.mesh.geometry.verticesNeedUpdate = true;
            
            for (var i=0; i < this.mesh.geometry.faces.length; i++) {
                face = this.mesh.geometry.faces[i];
                
                if (!_.contains(this.vertices, face.a) && !_.contains(this.vertices, face.b) && !_.contains(this.vertices, face.c)) {
                    face.materialIndex = 1;
                    
                    this.faces.push(face);
                }
            }
            
            this.add(this.mesh);
        }.bind(this));
    }

    Map.prototype = new THREE.Object3D;
    Map.prototype.constructor = Map;

    return Map;
})();