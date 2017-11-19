ng new ElDinero
npm install --save @angular/material @angular/cdk
npm install --save @angular/animations


cp -R  ~/Projects/eldinero/dist/ ~/Projects/publish/mgnath.github.io/

alphaadvantage apikey O22XVPSPMRTX7OGT

        "../node_modules/bootstrap/dist/css/bootstrap.min.css",


  getSMEData(){
    this.positions.forEach((e,i) => 
    {
      setTimeout(()=>{ 
        if (this.alive && (document.visibilityState != "hidden")) {
          this.avService.getStockSME(e.symbol).subscribe(dat=>console.log(dat["Technical Analysis: SMA"]));
        }
      },5000*i);
    });
  }