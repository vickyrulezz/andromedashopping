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
const PRODUCT = path.join(__dirname, '/images/product');
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
var outData = "";


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
app.use(express.static(PRODUCT));
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
//outData ='{${table}}';
outData = "OutputData";
resulthtml =`<html>
                <head>
                    <meta charset="utf-8">
                    <meta http-equiv="X-UA-Compatible" content="IE=edge">
                
                    <!-- Mobile Metas -->
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                
                    <!-- Site Metas -->
                    <title>KoolApp - Andromeda Shopping Kart</title>
                    <meta name="keywords" content="">
                    <meta name="description" content="">
                    <meta name="author" content="Vivek Saha">
                
                    <!-- Site Icons -->
                    <link rel="shortcut icon" href="images/favicon.ico" type="image/x-icon">
                    <link rel="apple-touch-icon" href="images/apple-touch-icon.png">
                
                    <!-- Bootstrap CSS -->
                    <link rel="stylesheet" href="css/bootstrap.min.css">
                    <!-- Site CSS -->
                    <link rel="stylesheet" href="css/style.css">
                    <!-- Responsive CSS -->
                    <link rel="stylesheet" href="css/responsive.css">
                    <!-- Custom CSS -->
                    <link rel="stylesheet" href="css/custom.css">
                </head>
                <body>
                `
                + outData +
                `
                <!-- ALL JS FILES -->
                <script src="js/jquery-3.2.1.min.js"></script>
                <script src="js/popper.min.js"></script>
                <script src="js/bootstrap.min.js"></script>
                <!-- ALL PLUGINS -->
                <script src="js/jquery.superslides.min.js"></script>
                <script src="js/bootstrap-select.js"></script>
                <script src="js/inewsticker.js"></script>
                <script src="js/bootsnav.js"></script>
                <script src="js/images-loded.min.js"></script>
                <script src="js/isotope.min.js"></script>
                <script src="js/owl.carousel.min.js"></script>
                <script src="js/baguetteBox.min.js"></script>
                <script src="js/form-validator.min.js"></script>
                <script src="js/contact-form-script.js"></script>
                <script src="js/custom.js"></script>

                </body>
            </html>`;
//resulthtml ='{${table}}';
//resulthtml ='<html><head><title>Kool App - Andromeda Product Page</title></head><body>{${table}}</body></html>';

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
                                <img src="images/product/`+results[i].SKU+`.jpg" class="img-fluid" alt="Image">
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
                                <span>`+ results[i].DESCRIPTION +`</span><br/>
                                <span>`+ results[i].PRODUCT_TYPE +`&emsp;&emsp;`+ results[i].BRAND +`</span><br/>
                                <span>`+ results[i].LONG_DESCRIPTION +`<span><br/>
                                <span> ₹ `+ results[i].LIST_PRICE +`</span><br/>
                                <span>`+ results[i].COLOR +`&emsp;&emsp;`+ results[i].SIZE +`</span><br/>
                                <span> In Stock : `+ results[i].IN_STOCK +`</span>
                            </div>
                        </div>
                    </div>
                    `;
        //table +='<tr><td>'+ (i+1) +'</td><td>'+ results[i].PRODUCT_TYPE +'</td><td>'+ results[i].SKU +'</td><td>'+ results[i].BRAND +'</td><td>'+ results[i].DESCRIPTION +'</td><td>'+ results[i].LONG_DESCRIPTION +'</td><td>'+ results[i].LIST_PRICE +'</td><td>'+ results[i].SIZE +'</td><td>'+ results[i].COLOR+'</td><td>'+ results[i].IN_STOCK +'</td></tr>';
	}
       table =`
            <div class="col-xl-9 col-lg-9 col-sm-12 col-xs-12 shop-content-right">
                <div class="right-product-box">
                    <div class="row product-categorie-box">
                        <div class="tab-content">
                            <div role="tabpanel" class="tab-pane fade show active" id="grid-view">
                                <div class="row">`
                                    + table +
                                `</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            `;

            //table ='<table border="1" bgcolor=" #ffffcc"><tr><th>Sr No.</th><th>PRODUCT_TYPE</th><th>SKU</th><th>BRAND</th><th>DESCRIPTION</th><th>LONG_DESCRIPTION</th><th>LIST_PRICE</th><th>SIZE</th><th>COLOR</th><th>IN_STOCK</th></tr>'+ table +'</table>';
	
    //resulthtml = resulthtml.replace('{${table}}', table);
    resulthtml = resulthtml.replace('OutputData', table);
	console.log(resulthtml);
	res.send(resulthtml);
  });
});

//GET ALL PRODUCTS - To retrieve all products - GRIDVIEW call this API ... URL/get_all_products
app.get('/get_products_gridview',function(req, res) {

    table = "";
    //outData ='{${table}}';
    outData = "OutputData";
    resulthtml =`<html>
                    <head>
                        <meta charset="utf-8">
                        <meta http-equiv="X-UA-Compatible" content="IE=edge">
                    
                        <!-- Mobile Metas -->
                        <meta name="viewport" content="width=device-width, initial-scale=1">
                    
                        <!-- Site Metas -->
                        <title>KoolApp - Andromeda Shopping Kart</title>
                        <meta name="keywords" content="">
                        <meta name="description" content="">
                        <meta name="author" content="Vivek Saha">
                    
                        <!-- Site Icons -->
                        <link rel="shortcut icon" href="images/favicon.ico" type="image/x-icon">
                        <link rel="apple-touch-icon" href="images/apple-touch-icon.png">
                    
                        <!-- Bootstrap CSS -->
                        <link rel="stylesheet" href="css/bootstrap.min.css">
                        <!-- Site CSS -->
                        <link rel="stylesheet" href="css/style.css">
                        <!-- Responsive CSS -->
                        <link rel="stylesheet" href="css/responsive.css">
                        <!-- Custom CSS -->
                        <link rel="stylesheet" href="css/custom.css">
                    </head>
                    <body>
                    `
                    + outData +
                    `
                    <!-- ALL JS FILES -->
                    <script src="js/jquery-3.2.1.min.js"></script>
                    <script src="js/popper.min.js"></script>
                    <script src="js/bootstrap.min.js"></script>
                    <!-- ALL PLUGINS -->
                    <script src="js/jquery.superslides.min.js"></script>
                    <script src="js/bootstrap-select.js"></script>
                    <script src="js/inewsticker.js"></script>
                    <script src="js/bootsnav.js"></script>
                    <script src="js/images-loded.min.js"></script>
                    <script src="js/isotope.min.js"></script>
                    <script src="js/owl.carousel.min.js"></script>
                    <script src="js/baguetteBox.min.js"></script>
                    <script src="js/form-validator.min.js"></script>
                    <script src="js/contact-form-script.js"></script>
                    <script src="js/custom.js"></script>
    
                    </body>
                </html>`;
    //resulthtml ='{${table}}';
    //resulthtml ='<html><head><title>Kool App - Andromeda Product Page</title></head><body>{${table}}</body></html>';
    
    let sql = `select XXPC.COMMODITY_NAME PRODUCT_TYPE, XXSKU.ITEM_NUMBER SKU, XXPS.BRAND ,XXSKU.DESCRIPTION,XXSKU.LONG_DESCRIPTION, 
    XXPR.LIST_PRICE,XXSKU.SKU_ATTRIBUTE_VALUE1 SIZE,XXSKU.SKU_ATTRIBUTE_VALUE2 COLOR,XXPR.IN_STOCK from 
    XXIBM_PRODUCT_SKU XXSKU,
    XXIBM_PRODUCT_PRICING XXPR,
    XXIBM_PRODUCT_STYLE XXPS,
    XXIBM_PRODUCT_CATALOGUE XXPC
    where XXSKU.ITEM_NUMBER = XXPR.ITEM_NUMBER
    and XXSKU.STYLE_ITEM = XXPS.ITEM_NUMBER
    AND XXSKU.CATALOGUE_CATEGORY=XXPC.COMMODITY`;
        
    console.log(sql);
      let query = mysqlClient.query(sql, (err, results, columns) => {
        if(err) throw err;
        
        for(var i=0; i<results.length; i++){
            table += `
                        <div class="col-sm-6 col-md-6 col-lg-4 col-xl-4">
                            <div class="products-single fix">
                                <div class="box-img-hover">
                                    <img src="images/product/`+results[i].SKU+`.jpg" class="img-fluid" alt="Image">
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
                                    <span>`+ results[i].DESCRIPTION +`</span><br/>
                                    <span>`+ results[i].PRODUCT_TYPE +`&emsp;&emsp;`+ results[i].BRAND +`</span><br/>
                                    <span>`+ results[i].LONG_DESCRIPTION +`<span><br/>
                                    <span> ₹ `+ results[i].LIST_PRICE +`</span><br/>
                                    <span>`+ results[i].COLOR +`&emsp;&emsp;`+ results[i].SIZE +`</span><br/>
                                    <span> In Stock : `+ results[i].IN_STOCK +`</span>
                                </div>
                            </div>
                        </div>
                        `;
        }
           table =`                 <div class="row">`
                                        + table +
                                    `</div>     `;
        
        //resulthtml = resulthtml.replace('{${table}}', table);
        resulthtml = resulthtml.replace('OutputData', table);
        console.log(resulthtml);
        res.send(resulthtml);
      });
    });
    

//GET ALL PRODUCTS - To retrieve all products - LISTVIEW call this API ... URL/get_all_products
app.get('/get_products_listview',function(req, res) {

    table = "";
    //outData ='{${table}}';
    outData = "OutputData";
    resulthtml =`<html>
                    <head>
                        <meta charset="utf-8">
                        <meta http-equiv="X-UA-Compatible" content="IE=edge">
                    
                        <!-- Mobile Metas -->
                        <meta name="viewport" content="width=device-width, initial-scale=1">
                    
                        <!-- Site Metas -->
                        <title>KoolApp - Andromeda Shopping Kart</title>
                        <meta name="keywords" content="">
                        <meta name="description" content="">
                        <meta name="author" content="Vivek Saha">
                    
                        <!-- Site Icons -->
                        <link rel="shortcut icon" href="images/favicon.ico" type="image/x-icon">
                        <link rel="apple-touch-icon" href="images/apple-touch-icon.png">
                    
                        <!-- Bootstrap CSS -->
                        <link rel="stylesheet" href="css/bootstrap.min.css">
                        <!-- Site CSS -->
                        <link rel="stylesheet" href="css/style.css">
                        <!-- Responsive CSS -->
                        <link rel="stylesheet" href="css/responsive.css">
                        <!-- Custom CSS -->
                        <link rel="stylesheet" href="css/custom.css">
                    </head>
                    <body>
                    `
                    + outData +
                    `
                    <!-- ALL JS FILES -->
                    <script src="js/jquery-3.2.1.min.js"></script>
                    <script src="js/popper.min.js"></script>
                    <script src="js/bootstrap.min.js"></script>
                    <!-- ALL PLUGINS -->
                    <script src="js/jquery.superslides.min.js"></script>
                    <script src="js/bootstrap-select.js"></script>
                    <script src="js/inewsticker.js"></script>
                    <script src="js/bootsnav.js"></script>
                    <script src="js/images-loded.min.js"></script>
                    <script src="js/isotope.min.js"></script>
                    <script src="js/owl.carousel.min.js"></script>
                    <script src="js/baguetteBox.min.js"></script>
                    <script src="js/form-validator.min.js"></script>
                    <script src="js/contact-form-script.js"></script>
                    <script src="js/custom.js"></script>
    
                    </body>
                </html>`;
    
    let sql = `select XXPC.COMMODITY_NAME PRODUCT_TYPE, XXSKU.ITEM_NUMBER SKU, XXPS.BRAND ,XXSKU.DESCRIPTION,XXSKU.LONG_DESCRIPTION, 
    XXPR.LIST_PRICE,XXSKU.SKU_ATTRIBUTE_VALUE1 SIZE,XXSKU.SKU_ATTRIBUTE_VALUE2 COLOR,XXPR.IN_STOCK from 
    XXIBM_PRODUCT_SKU XXSKU,
    XXIBM_PRODUCT_PRICING XXPR,
    XXIBM_PRODUCT_STYLE XXPS,
    XXIBM_PRODUCT_CATALOGUE XXPC
    where XXSKU.ITEM_NUMBER = XXPR.ITEM_NUMBER
    and XXSKU.STYLE_ITEM = XXPS.ITEM_NUMBER
    AND XXSKU.CATALOGUE_CATEGORY=XXPC.COMMODITY`;
        
    console.log(sql);
      let query = mysqlClient.query(sql, (err, results, columns) => {
        if(err) throw err;
        
        for(var i=0; i<results.length; i++){
            table += `
                        <div class="col-sm-6 col-md-6 col-lg-4 col-xl-4">
                            <div class="products-single fix">
                                <div class="box-img-hover">
                                    <img src="images/product/`+results[i].SKU+`.jpg" class="img-fluid" alt="Image">
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
                                    <span>`+ results[i].DESCRIPTION +`</span><br/>
                                    <span>`+ results[i].PRODUCT_TYPE +`&emsp;&emsp;`+ results[i].BRAND +`</span><br/>
                                    <span>`+ results[i].LONG_DESCRIPTION +`<span><br/>
                                    <span> ₹ `+ results[i].LIST_PRICE +`</span><br/>
                                    <span>`+ results[i].COLOR +`&emsp;&emsp;`+ results[i].SIZE +`</span><br/>
                                    <span> In Stock : `+ results[i].IN_STOCK +`</span>
                                </div>
                            </div>
                        </div>
                        `;
            //table +='<tr><td>'+ (i+1) +'</td><td>'+ results[i].PRODUCT_TYPE +'</td><td>'+ results[i].SKU +'</td><td>'+ results[i].BRAND +'</td><td>'+ results[i].DESCRIPTION +'</td><td>'+ results[i].LONG_DESCRIPTION +'</td><td>'+ results[i].LIST_PRICE +'</td><td>'+ results[i].SIZE +'</td><td>'+ results[i].COLOR+'</td><td>'+ results[i].IN_STOCK +'</td></tr>';
        }
           table =`
                                <div class="list-view-box">
                                    <div class="row">`
                                        + table +
                                    `</div>
                                </div>
                `;
        
        //resulthtml = resulthtml.replace('{${table}}', table);
        resulthtml = resulthtml.replace('OutputData', table);
        console.log(resulthtml);
        res.send(resulthtml);
      });
    });


// Port Listen
app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;
