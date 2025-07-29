var eyes = {
  prepped : false,
  spread : 12,
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
    };
  },
  ix : function(R, G, B) { // Returns the index of the cube in the 3D environment at position (R,G,B)
    return (R>=0&G>=0&B>=0&R<256&G<256&B<256)?(65536*R+256*G+B):16777216; // Slot 16777216 is the "Garbage Outward Overflow Slot Exit" (GOOSE)
  },
  xi : function(Ix) { // Returns the position of a cube in (R, G, B) given it's array index (Essentially opposite of ix)
    return [Math.floor(Ix/65536), Math.floor((Ix%65536)/256), Ix%256];
  },
  addPix : function(R, G, B, X, Y, cam='n') { // Adds pixel to virtual 3d database.  Set cam to 'l', 'r', or 'n' depending on whether pixel is in left camera view, right camera view, or no camera view, respectively.
    if (cam == 'l') {
      if (this.coords.lx[this.ix(R,G,B)] == undefined) {
        this.coords.lx[this.ix(R,G,B)] = [];
        this.coords.ly[this.ix(R,G,B)] = [];
      }
      this.coords.lx[this.ix(R,G,B)].push(X);
      this.coords.ly[this.ix(R,G,B)].push(Y);
    } else if (cam == 'r') {
      if (this.coords.rx[this.ix(R,G,B)] == undefined) {
        this.coords.rx[this.ix(R,G,B)] = [];
        this.coords.ry[this.ix(R,G,B)] = [];
      }
      this.coords.rx[this.ix(R,G,B)].push(X);
      this.coords.ry[this.ix(R,G,B)].push(Y);
    }
    for (let i=1; i<=this.spread; i++) {
      for (let r = R-i+1; r < R+i; r++) {
        for (let g = G-i+1; g < G+i; g++) {
          for (let b = B-i+1; b < B+i; b++) {
            this.v3d[this.ix(r,g,b)]++;
          }
        }
      }
    }
  },
  density : function(R, G, B) { // Returns the density value at a position in the 3D environment
    return this.v3d[this.ix(R,G,B)];
  },
  max : function() { // Returns the slot in the 3D environment that holds the maximum density out of all un-blobbed slots
    this.v3d[16777216] = 0; // Clear GOOSE
    let m = 0;
    for (let i=0; i<16777216; i++) {
      if (this.v3d[i] > m) {
        m = this.v3d[i];
      }
    }
    return m;
  },
  blobify : function(msl=300) { // Pulls a list of blobs from the 3D environment
    this.blobs = [];
    var newBlob = {};
    var agents = [];
    let index = 0;
    let r, g, b, m;
    while (true) {
      m = this.max();
      if (m < msl) {
        return this.blobs.length;
      }
      newBlob = {};
      index = this.v3d.indexOf(m);
      [r,g,b] = this.xi(index);
      newBlob.r = r;
      newBlob.g = g;
      newBlob.b = b;
      newBlob.colour = "rgb("+r+','+g+','+b+')';
      newBlob.lx = [];
      newBlob.ly = [];
      newBlob.rx = [];
      newBlob.ry = [];
      agents.push(index);
      this.v3d[index] = 0;
      while (agents.length > 0) {
        index = agents.shift();
        if (this.coords.lx[index] != undefined) { newBlob.lx.push(...this.coords.lx[index]); }
        if (this.coords.ly[index] != undefined) { newBlob.ly.push(...this.coords.ly[index]); }
        if (this.coords.rx[index] != undefined) { newBlob.rx.push(...this.coords.rx[index]); }
        if (this.coords.ry[index] != undefined) { newBlob.ry.push(...this.coords.ry[index]); }
        [r,g,b] = this.xi(index);
        if (this.density(r,g,b-1) > msl*0.77) { agents.push(index-1); this.v3d[index-1] = 0; }
        if (this.density(r,g,b+1) > msl*0.77) { agents.push(index+1); this.v3d[index+1] = 0; }
        if (this.density(r,g-1,b) > msl*0.77) { agents.push(index-256); this.v3d[index-256] = 0; }
        if (this.density(r,g+1,b) > msl*0.77) { agents.push(index+256); this.v3d[index+256] = 0; }
        if (this.density(r-1,g,b) > msl*0.77) { agents.push(index-65536); this.v3d[index-65536] = 0; }
        if (this.density(r+1,g,b) > msl*0.77) { agents.push(index+65536); this.v3d[index+65536] = 0; }
      }
      newBlob.lx1 = Math.min(...newBlob.lx);
      newBlob.lx2 = Math.max(...newBlob.lx);
      newBlob.ly1 = Math.min(...newBlob.ly);
      newBlob.ly2 = Math.max(...newBlob.ly);
      newBlob.rx1 = Math.min(...newBlob.rx);
      newBlob.rx2 = Math.max(...newBlob.rx);
      newBlob.ry1 = Math.min(...newBlob.ry);
      newBlob.ry2 = Math.max(...newBlob.ry);
      this.blobs.push(newBlob);
    }
  }
}