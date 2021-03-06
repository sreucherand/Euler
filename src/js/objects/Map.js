var Map = (function(){
    
    var API_KEY = 'AIzaSyCURimnNCqfo0xFdpvx-gh2KmsyIxTZa0A';
    var particleSize = 5;
    var lightgrey = 0xdddddd;
    
    function Map(){
        THREE.Object3D.call(this);
        
        this.width = 1000;
        this.height = 500;
        
        this.vertices = [];
        this.faces = [];
        this.pins = [];
        this.zoom = false;
    }

    Map.prototype = new THREE.Object3D;
    Map.prototype.constructor = Map;
    
    Map.prototype.init = function (callback) {
        var resolution = 10;
        
        var colors = [];
        
        colors.push(new THREE.Color(0.05, 0.05, 0.05));
        colors.push(new THREE.Color(0.075, 0.075, 0.075));
        colors.push(new THREE.Color(0.1, 0.1, 0.1));
        
        var geometry = new THREE.PlaneGeometry(this.width, this.height, this.width / resolution, this.height / resolution);
        var material = new THREE.MeshFaceMaterial([new THREE.MeshPhongMaterial({color: 0x222222, wireframe: true}), new THREE.MeshBasicMaterial({transparent: true, opacity: 0})])
        
        this.mesh = new THREE.Mesh(geometry, material);
        
        var bumpMapDeferred = new $.Deferred();
        var specularMapDeferred = new $.Deferred();
        
        var textureLoader = new THREE.TextureLoader();
        
        textureLoader.load('public/img/bump_map.jpg', function (data) {
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');
            
            canvas.width = this.width;
            canvas.height = this.height;
            
            context.drawImage(data.image, 0, 0, this.width, this.height);
            
            bumpMapDeferred.resolve(context);
        }.bind(this));
        textureLoader.load('public/img/specular_map.jpg', function (data) {
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');
            
            canvas.width = this.width;
            canvas.height = this.height;
            
            context.drawImage(data.image, 0, 0, this.width, this.height);
            
            specularMapDeferred.resolve(context);
        }.bind(this));
        
        $.when(bumpMapDeferred, specularMapDeferred).done(function (bumpMap, specularMap) {
            var column = 0;
            var line = 0;
            
            for (var i=0; i < this.mesh.geometry.vertices.length; i++) {
                vertice = this.mesh.geometry.vertices[i];
                cvertice = this.mesh.geometry.vertices[i];
                
                data = bumpMap.getImageData(column * resolution, line * resolution, 1, 1).data;
                color = new THREE.Color(data[0]/255, data[1]/255, data[2]/255);
                color = color.getHSL();
                
                altitude = color.l;
                
                data = specularMap.getImageData(column * resolution, line * resolution, 1, 1).data;
                color = new THREE.Color(data[0]/255, data[1]/255, data[2]/255);
                color = color.getHSL();
                
                specular = color.l;
                
                if (Math.abs(vertice.x) !== this.width/2 && Math.abs(vertice.y) !== this.height/2) {
                    vertice.x += Math.random() * 10;
                    vertice.y += Math.random() * 10;
                    
                    if (specular < 0.5) {
                        vertice.z += altitude * 50;
                        
                        this.vertices.push(i);
                    } else {
                        vertice.z = 0;
                    }
                }
                if (++column === (this.width / resolution) + 1) {
                    column = 0;
                    line++;
                }
            }
            
            this.mesh.geometry.verticesNeedUpdate = true;
            
            material = new THREE.MeshFaceMaterial([new THREE.MeshPhongMaterial({color: colors[0], shininess: 20}), new THREE.MeshPhongMaterial({color: colors[1], shininess: 20}), new THREE.MeshPhongMaterial({color: colors[2], shininess: 20}), new THREE.MeshBasicMaterial({transparent: true, opacity: 0})]);
        
            var clone = new THREE.Mesh(this.mesh.geometry.clone(), material);
            
            clone.position.z -= 1;
            
            for (var i=0; i < this.mesh.geometry.faces.length; i++) {
                face = this.mesh.geometry.faces[i];
                cface = clone.geometry.faces[i];
                
                if (!_.contains(this.vertices, face.a) && !_.contains(this.vertices, face.b) && !_.contains(this.vertices, face.c)) {
                    face.materialIndex = 1;
                    cface.materialIndex = 3;
                    
                    this.faces.push(face);
                } else {
                    cface.materialIndex = Math.floor(Math.random()*3);
                }
            }
            
            var attributes = {
                size: {type: 'f', value: []},
                opacity: {type: 'f', value: []}
			};
			var uniforms = {
                amplitude: {type: "f", value: 1.0},
				color: {type: "c", value: new THREE.Color(0xffffff)},
				texture: {type: "t", value: THREE.ImageUtils.loadTexture('public/img/bokeh_texture.png')}
			};
            uniforms.texture.value.wrapS = uniforms.texture.value.wrapT = THREE.RepeatWrapping;

			var shaderMaterial = new THREE.ShaderMaterial({
				uniforms: uniforms,
				attributes: attributes,
				vertexShader: document.getElementById('vertexshader').textContent,
				fragmentShader: document.getElementById('fragmentshader').textContent,
				transparent: true,
                blending: THREE.AdditiveBlending
			});
            
            this.pointCloud = new THREE.PointCloud(new THREE.Geometry(), shaderMaterial);
            
            for (var i=0; i<this.vertices.length; i++) {
                attributes.size.value.push(0);
                attributes.opacity.value.push(0);
                
                this.pointCloud.geometry.vertices.push(this.mesh.geometry.vertices[this.vertices[i]].clone());
            }
            
            this.add(clone);
            
            this.add(this.mesh);
            this.add(this.pointCloud);
            
            if (typeof callback === 'function') {
                callback();
            }
        }.bind(this));
    };
    
    Map.prototype.pin = function (centroid) {
        if (this.zoom && this.transition) {
            this.dezoom();
            return;
        } else if (this.zoom) {
            return;
        }
        this.zoom = true;
        
        var tolerance = 150;
        var latitude = centroid.y*180 / (this.height-tolerance);
        var longitude = centroid.x*360 / (this.width);
        var api = 'https://maps.googleapis.com/maps/api/geocode/json?result_type=country&latlng='+latitude+','+longitude+'&key='+API_KEY;
        
        $.getJSON(api, function (data) {
            if (data.results.length) {
                var fontSize = 5;
                
                var shapes = THREE.FontUtils.generateShapes(data.results[0].formatted_address, {font: 'lora', size: fontSize});
                var material = new THREE.LineBasicMaterial({color: lightgrey, transparent: true, opacity: 1});
                var geometry = new THREE.Geometry();

                var line = new THREE.Line(geometry, material);
                
                line.geometry.vertices.push(new THREE.Vector3(centroid.x, centroid.y, centroid.z+35));
                line.geometry.vertices.push(new THREE.Vector3(centroid.x, centroid.y, centroid.z+35));
                
                geometry = new THREE.ShapeGeometry(shapes);
                material = new THREE.MeshBasicMaterial({color: lightgrey, transparent: true, opacity: 0});
                
                var text = new THREE.Mesh(geometry, material);
                
                text.position.x = centroid.x + 5;
                text.position.y = centroid.y;
                text.position.z = centroid.z + 35 - fontSize;
                text.rotation.x = Math.PI / 2;
                
                this.add(line);
                this.add(text);
                
                var timeline = new TimelineMax({paused: true, onUpdate: function () {
                    line.geometry.verticesNeedUpdate = true;
                    text.material.needUpdate = true;
                }});
                
                $('body').attr('class', 'close');
                
                timeline.to(this.camera.position, 2, {x: centroid.x, y: centroid.y, z: 250, ease:Expo.easeOut});
                timeline.to(line.geometry.vertices[1], 0.5, {z: centroid.z, ease:Expo.easeInOut}, 1);
                timeline.to(text.material, 0.5, {opacity: 1, ease:Expo.easeOut}, '-=0.4');
                timeline.addCallback(function () {
                    this.transition = true;
                }.bind(this));
                timeline.play();

                this.pins.push({
                    origin: centroid,
                    line: line,
                    text: text,
                    birth: new Date()
                });
            } else {
                this.zoom = false;
            }
        }.bind(this)).error(function() {
            this.zoom = false;
        }.bind(this));
    };
    
    Map.prototype.dezoom = function (intersection) {
        if (!this.zoom) {
            return;
        }
        
        for (var i=0; i<this.pins.length; i++) {
            pin = this.pins[i];
            
            TweenMax.to(pin.line.material, 0.75, {opacity: 0, ease:Expo.easeOut});
            TweenMax.to(pin.text.material, 0.75, {opacity: 0, ease:Expo.easeOut});
        }
        TweenMax.to(this.camera.position, 1.5, {x: 0, y: 0, z: 600, ease:Expo.easeOut, onComplete: function () {
            this.transition = false;
            this.zoom = false;
        }.bind(this)});
        
        $('body').attr('class', 'search');
    };
    
    Map.prototype.update = function (frame) {
        if (this.pointCloud) {
			for(var i=0; i<this.pointCloud.material.attributes.size.value.length; i++) {
                particule = this.pointCloud.geometry.vertices[i];
                ref = this.mesh.geometry.vertices[this.vertices[i]];
                
                particule.x = ref.x + Math.sin(frame*0.01+i)*2;
                particule.y = ref.y + Math.sin(frame*0.01-i)*2;
                
				this.pointCloud.material.attributes.size.value[i] = Math.abs(Math.sin(frame*0.01+i)*particleSize)+2;
				this.pointCloud.material.attributes.opacity.value[i] = Math.abs(Math.sin(frame*0.01+i/2));
                
			}
            this.pointCloud.material.attributes.size.needsUpdate = true;
            this.pointCloud.material.attributes.opacity.needsUpdate = true;
            this.pointCloud.geometry.verticesNeedUpdate = true;
        }
    };

    return Map;
})();