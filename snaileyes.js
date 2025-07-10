var eyes = {
  prepped : false,
  spread : 5,
  prep : function(Size=255*255*255) { // Creates/resets virtual 3D environment
    if (!this.prepped) {
      this.v3d = {
        density : new Array(Size),
        lx : new Array(Size),
        ly : new Array(Size),
        rx : new Array(Size),
        ry : new Array(Size)
      }
      this.prepped = true;
    }
    this.v3d.density.fill(0);
    this.v3d.lx.fill([]);
    this.v3d.ly.fill([]);
    this.v3d.rx.fill([]);
    this.v3d.ry.fill([]);
    this.blobs = [];
  },
  ix : function(R, G, B) { // Returns the index of the cube in the arrays at position (R,G,B) in the 3D environment
    return 65536*(R<0?0:R>255?255:R)+256*(G<0?0:G>255?255:G)+(B<0?0:B>255?255:B);
  },
  addPix : function(R, G, B, X, Y, cam='n') { // Adds pixel to virtual 3d database.  Set cam to 'l', 'r', or 'n' depending on whether pixel is in left camera view, right camera view, or no camera view, respectively.
    //for (var i=0; i<)
    this.v3d.density[this.ix(R,G,B)] += this.spread;
    if (cam == 'l') {
      this.v3d.lx[this.ix(R,G,B)].push(X);
      this.v3d.ly[this.ix(R,G,B)].push(Y);
    } else if (cam == 'r') {
      this.v3d.rx[this.ix(R,G,B)].push(X);
      this.v3d.ry[this.ix(R,G,B)].push(Y);
    }
  },
  max : function() { // Returns the slot in the 3D environment that holds the maximum density out of all un-blobbed slots
    var maxs = [];
    for (var i=0; i<this.v3d.density.length; i+=124370) {
      maxs.push(Math.max(...this.v3d.density.slice(i,i+124370)));
    }
    return Math.max(...maxs);
  }
}

console.log("Prepping...");
eyes.prep();
console.log("Setting...");
eyes.addPix(0,0,0,0,0);
console.log("Getting max...");
var Max = eyes.max(); // Should be equal to spread value
console.log(Max);