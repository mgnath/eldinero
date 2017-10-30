import { Injectable } from '@angular/core';
import { Headers, Http, Response, RequestOptions, Jsonp } from '@angular/http';
import 'rxjs/add/operator/map';
import * as $ from 'jquery';
import { OAuth, OAuthOpts, OAuthConsumer } from 'node-oauth-1.0a-ts';



@Injectable()
export class StockServiceBKP {

  constructor() { }

  GetTradingAPI(){
    var credentials = {
        consumer_key: "6eYJX64ZJjh9Mclv6FXAkzDmN5zHlBq72jG2MUr1dv81",
        consumer_secret: "CFKS6zho3HBTIYa6qHMGTYicTY34kFv4x4VFofEdm5s7",
        access_token: "N06CBFHjxeCax8ZXCxxFf5VvBNtfI7EoLXRMwFQW0gc4",
        access_secret: "ErujSnC6E5QsY78dSjZrMJJFzreaBTh33oWanuzsMy47"
    };
    let opts:OAuthOpts={
        version:"1.0",
        signature_method:"HMAC-SHA1",
        consumer :{public: credentials.consumer_key,secret:credentials.consumer_secret},
        nonce_length:32,
        last_ampersand:true,
        parameter_separator:""
    };

    var oauth:OAuth;//= new OAuth(opts);


    let request = { method: 'POST', url: 'https://stream.tradeking.com/v1/market/quotes?symbols=AAPL', 
            data: { status: 'Hello, world!' } }; 
    let token = { public: credentials.access_token, private: credentials.access_secret }; 
    let oauth_data = oauth.authorize(request, token); 
    console.log(oauth_data);

    /*  request = oa.authorize() get("https://stream.tradeking.com/v1/market/quotes?symbols=AAPL", 
    credentials.access_token, 
    credentials.access_secret);
    request.on('response', function (response) {
        response.setEncoding('utf8');
        response.on('data', function(data) {
            console.log(data);
        })
    });
    request.end(); */
  }
  

  GetJsonPResponse(Tickers: string[], callback) {
        var apiServicePath = "http://finance.google.com/finance/info?q=" + Tickers.join();
        $.ajax({
            crossDomain: true,
            dataType: "jsonp",
            url: apiServicePath,
            async: false,
            context: document.body
        }).done(function (data:any) {
            callback(data);
        });
    };
}
