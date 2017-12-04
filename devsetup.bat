git clone eldinero from github
npm install --save @angular/material @angular/cdk
npm install --save @angular/animations


alphaadvantage apikey O22XVPSPMRTX7OGT



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