module.exports = function(data, scene, geometry, materials, light, marker){
  _.extend(this, data);

  this.scene = scene;
  this.light = light;
  this.marker = marker;

  this.phase = 0;

  this.model = new THREE.Object3D();

  materials = [].concat(materials);

  for (var s in materials) {
    if (materials[s].name == "02___Default"){
      

      var n = materials[s].name;

      materials[s] = new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } );
      materials[s].name = n;
    }
  }
      

  this.body = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial( materials ));
  this.body.material.ambient = this.body.material.color;
  this.body.castShadow = true;
  this.body.receiveShadow = true;

  this.light2 = new THREE.PointLight( 0xff6600, 5, 120 ); 
  this.light2.visible = false;
  this.light2.position.y = 90; 
  this.light2.position.z = 20; 
  this.body.add( this.light2 );

  this.model.add(this.body);
  this.scene.add( this.model );

  this.model.scale.x = 0.000001;
  this.model.scale.y = 0.000001;
  this.model.scale.z = 0.000001;

  TweenLite.to(this.model.scale, 1, {x: 1, y: 1, z: 1, ease: Elastic.easeOut});
}

_.extend(module.exports.prototype, {
  render: function(){

    if (this.directions.left && this.directions.top)
       this.model.rotation.y =  -135 * (Math.PI / 180);
    else
    if (this.directions.right && this.directions.top)
       this.model.rotation.y =  135 * (Math.PI / 180);
    else
    if (this.directions.left && this.directions.bottom)
       this.model.rotation.y =  -45 * (Math.PI / 180);
    else
    if (this.directions.right && this.directions.bottom)
       this.model.rotation.y =  45 * (Math.PI / 180);
    else
    if (this.directions.left)
       this.model.rotation.y =  -90 * (Math.PI / 180);
    else
    if (this.directions.right)
       this.model.rotation.y =  90 * (Math.PI / 180);
    else
    if (this.directions.top)
       this.model.rotation.y =  180 * (Math.PI / 180);
    else
    if (this.directions.bottom)
       this.model.rotation.y =  0 * (Math.PI / 180);

    var mx = this.model.position.x - (this.x - 400);
    var my = this.model.position.z - (this.y - 300);

    this.model.position.x = this.x - 400;
    this.model.position.z = this.y - 300;

    if (this.hasTreasure) {
      this.light.position.x = this.x - 400;
      this.light.position.z = this.y - 300;  

      this.marker.position.x = this.x - 400;
      this.marker.position.z = this.y - 300;  

      this.marker.rotation.x += 0.05;
    }

    if (this.light2.visible != this.hasTreasure && this.hasTreasure) {
      this.marker.scale.set( 0.00001, 0.00001, 0.00001 );
      TweenLite.to(this.marker.scale, 0.2, {x: 1, y: 1, z: 1, ease: Cubic.easeOut});
    }

    this.light2.visible = this.hasTreasure;

    return this;
  },
  remove: function(){
    this.scene.remove(this.model);
  }
});