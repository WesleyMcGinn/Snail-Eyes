var eyes = {
  prepped : false,
  spread : 5,
  prep : function() { // Creates/resets virtual 3D environment
    if (!this.prepped) {
      this.v3d = new Uint32Array(16777217),
      this.prepped = true;
    }
    this.v3d.fill(0);
    this.coords = {
      lx : [],
      ly : [],
      rx : [],
      ry : []
    }
    this.blobs = [];
  },
  ix : function(R, G, B) { // Returns the index of the cube in the 3D environment at position (R,G,B)
    return (R>=0&G>=0&B>=0&R<256&G<256&B<256)?(65536*R+256*G+B):16777216; // Slot 16777216 is the "Garbage Outward Overflow Slot Exit" (GOOSE)
  },
  addPix : function(R, G, B, X, Y, cam='n') { // Adds pixel to virtual 3d database.  Set cam to 'l', 'r', or 'n' depending on whether pixel is in left camera view, right camera view, or no camera view, respectively.
    if (cam == 'l') {
      this.coords.lx[this.ix(R,G,B)] = X;
      this.coords.ly[this.ix(R,G,B)] = Y;
    } else if (cam == 'r') {
      this.coords.rx[this.ix(R,G,B)] = X;
      this.coords.ry[this.ix(R,G,B)] = Y;
    }
    for (var i=1; i<=this.spread; i++) {
      for (var r = R-i+1; r < R+i; r++) {
        for (var g = G-i+1; g < G+i; g++) {
          for (var b = B-i+1; b < B+i; b++) {
            this.v3d[this.ix(r,g,b)]++;
          }
        }
      }
    }
  },
  max : function() { // Returns the slot in the 3D environment that holds the maximum density out of all un-blobbed slots
    this.v3d[16777216] = 0; // Clear GOOSE
    return this.v3d.reduce((max, current) => Math.max(max, current), 0);
  }
}

console.log("Prepping...");
eyes.prep();
console.log("Setting...");
for (var i=0; i<64*48; i++) {
  eyes.addPix(Math.floor(Math.random() * 256),Math.floor(Math.random() * 256),Math.floor(Math.random() * 256),i%64,Math.floor(i/64),'l');
}
console.log("Getting max...");
var Max = eyes.max(); // Should be equal to spread value
console.log(Max);