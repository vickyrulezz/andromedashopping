var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mysql = require("mysql");
const http = require('http');
var fs = require("fs");
var path = require('path');
const VIEWS = path.join(__dirname, '/views');
const CSS = path.join(__dirname, '/css');
const JSCRIPT = path.join(__dirname, '/js');
const FONTS = path.join(__dirname, '/fonts');
const IMAGES = path.join(__dirname, '/images');
const PAYMENT_ICON = path.join(__dirname, '/images/payment-icon');
const PHP = path.join(__dirname, '/php');
const WEBFONTS = path.join(__dirname, '/webfonts');
// HTML Table presentation
var _ = require('lodash');
var createHTML = require('create-html');
var tableHtml = "";
var date = new Date();
var json_data = "";
//html string that will be send to browser
var table = "";
var resulthtml ="";
var searchParam = "";


console.log("path :"+path);
console.log("VIEWS :"+VIEWS);
console.log("CSS :"+CSS);
console.log("IMAGES :"+IMAGES);


var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0'
    ;

// Using JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

Object.assign=require('object-assign')

/*
app.set('views', VIEWS);
app.set('css', CSS);
app.set('js', JSCRIPT);
app.set('fonts', FONTS);
app.set('images', IMAGES);
app.set('images/payment-icon', PAYMENT_ICON);
app.set('php', PHP);
app.set('webfonts', WEBFONTS);
*/

app.engine('html', require('ejs').renderFile);
//app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

// Using all images, css , javscript
app.use(express.static(VIEWS));
app.use(express.static(CSS));
app.use(express.static(JSCRIPT));
app.use(express.static(FONTS));
app.use(express.static(IMAGES));
app.use(express.static(PAYMENT_ICON));
app.use(express.static(PHP));
app.use(express.static(WEBFONTS));

//mysql configuration - Gamification project mysql connect details
var mysqlHost = process.env.OPENSHIFT_MYSQL_DB_HOST || 'custom-mysql.gamification.svc.cluster.local';
var mysqlPort = process.env.OPENSHIFT_MYSQL_DB_PORT || 3306;
var mysqlUser = 'xxuser'; 
var mysqlPass = 'welcome1';
var mysqlDb = 'sampledb';


//form the connection string to connect to mysql - you can connect directly too 
var mysqlString = 'mysql://' + mysqlUser + ':' + mysqlPass + '@' + mysqlHost + ':' + mysqlPort + '/' + mysqlDb;
console.log(mysqlString);


app.get('/', function (req, res) {
    res.render('index.html', { root : VIEWS });
});

app.get("/getallproducts", function (req, res) {
    res.sendFile('allproducts.html', { root : VIEWS });
    searchParam = req.query.txtSearch;
  });

 /* DATABASE operations */

//connect to mysql/sampledb database
var mysqlClient = mysql.createConnection(mysqlString);
mysqlClient.connect(function (err) {
    if (err) console.log(err);
});

//GET DB STATUS - To validate if database is running call this API ... URL/isdbon
app.get('/api/status/db', function (req, res) {
    mysqlClient.query('SELECT 0 + 0 AS status', function (err, rows, fields) {
        if (err) {
            res.send('MYSQL IS NOT CONNECTED' + JSON.stringify(err));
        } else {
            res.send('MYSQL IS CONNECTED - Status Msg: ' + rows[0].status);
        }
    });
});

//GET ALL PRODUCTS - To retrieve all all products call this API ... URL/get_all_products
app.get('/get_all_products',function(req, res) {

table = "";
resulthtml ='<html><head><title>Kool App - Andromeda Product Page</title></head><body>{${table}}</body></html>';

let sql = `select XXPC.COMMODITY_NAME PRODUCT_TYPE, XXSKU.ITEM_NUMBER SKU, XXPS.BRAND ,XXSKU.DESCRIPTION,XXSKU.LONG_DESCRIPTION, 
XXPR.LIST_PRICE,XXSKU.SKU_ATTRIBUTE_VALUE1 SIZE,XXSKU.SKU_ATTRIBUTE_VALUE2 COLOR,XXPR.IN_STOCK from 
XXIBM_PRODUCT_SKU XXSKU,
XXIBM_PRODUCT_PRICING XXPR,
XXIBM_PRODUCT_STYLE XXPS,
XXIBM_PRODUCT_CATALOGUE XXPC
where XXSKU.ITEM_NUMBER = XXPR.ITEM_NUMBER
and XXSKU.STYLE_ITEM = XXPS.ITEM_NUMBER
AND XXSKU.CATALOGUE_CATEGORY=XXPC.COMMODITY
AND (upper(XXSKU.ITEM_NUMBER) like upper('%`+searchParam+`%') 
OR upper(XXPC.COMMODITY_NAME) like upper('%`+searchParam+`%') 
OR upper(XXSKU.DESCRIPTION) like upper('%`+searchParam+`%') 
OR upper(XXSKU.LONG_DESCRIPTION) like upper('%`+searchParam+`%')
)`;
    
console.log(sql);
  let query = mysqlClient.query(sql, (err, results, columns) => {
    if(err) throw err;
	
	for(var i=0; i<results.length; i++){
        table += `
                    <div class="col-sm-6 col-md-6 col-lg-4 col-xl-4">
                        <div class="products-single fix">
                            <div class="box-img-hover">
                                <img src="images/img-pro-01.jpg" class="img-fluid" alt="Image">
                                <div class="mask-icon">
                                    <ul>
                                        <li><a href="#" data-toggle="tooltip" data-placement="right" title="View"><i class="fas fa-eye"></i></a></li>
                                        <li><a href="#" data-toggle="tooltip" data-placement="right" title="Compare"><i class="fas fa-sync-alt"></i></a></li>
                                        <li><a href="#" data-toggle="tooltip" data-placement="right" title="Add to Wishlist"><i class="far fa-heart"></i></a></li>
                                    </ul>
                                    <a class="cart" href="#">Add to Cart</a>
                                </div>
                            </div>
                            <div class="why-text">
                                <h4>`+ results[i].DESCRIPTION +`</h4><br/>
                                <h4>`+ results[i].PRODUCT_TYPE +`&emsp;&emsp;`+ results[i].BRAND +`</h4><br/>
                                <h5>`+ results[i].LONG_DESCRIPTION +`<h5><br/>
                                <h5> ₹ `+ results[i].LIST_PRICE +`</h5><br/>
                                <h5>`+ results[i].COLOR +`&emsp;&emsp;`+ results[i].SIZE +`</h5><br/>
                                <h5>`+ results[i].IN_STOCK +`</h5><br/>
                            </div>
                        </div>
                    </div>
                    `;
        //table +='<tr><td>'+ (i+1) +'</td><td>'+ results[i].PRODUCT_TYPE +'</td><td>'+ results[i].SKU +'</td><td>'+ results[i].BRAND +'</td><td>'+ results[i].DESCRIPTION +'</td><td>'+ results[i].LONG_DESCRIPTION +'</td><td>'+ results[i].LIST_PRICE +'</td><td>'+ results[i].SIZE +'</td><td>'+ results[i].COLOR+'</td><td>'+ results[i].IN_STOCK +'</td></tr>';
	}
       table =`<div class="row product-categorie-box">
                    <div class="tab-content">
                        <div role="tabpanel" class="tab-pane fade show active" id="grid-view">
                            <div class="row">`
                            + table +
                        `</div>
                        </div>
                    </div>
                </div>`;
	
	resulthtml = resulthtml.replace('{${table}}', table);
	console.log(resulthtml);
	res.send(resulthtml);
  });
});



// Port Listen
app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;
