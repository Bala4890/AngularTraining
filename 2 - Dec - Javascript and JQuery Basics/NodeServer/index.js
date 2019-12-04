const express = require('express');
const app = express();
var request = require('request');
var tuc = require('temp-units-conv');
const axios =  require('axios')

const CHENNAI_URL = 'http://saharapackers.com/images/chennai.jpg'
const TOKYO_URL = 'https://cdn140.picsart.com/309879422216201.jpg?c480x480'
const LONDON_URL = 'https://cdn141.picsart.com/308955239126201.jpg?c480x480'
const CALIFORNIA_URL = 'https://www.planetware.com/photos-large/USCA/california-yosemite-falls-reflection-and-trees.jpg'
const MOSCOW_URL = 'https://www.aerointernational.de/content/uploads/2019/09/Cupola20of20Saint20Basil27s20Cathedral2020CR20Shutterstock-fec0052c.jpg'
const SYDNEY_URL = 'https://media.tacdn.com/media/attractions-splice-spp-674x446/06/6f/6e/7e.jpg'

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded());

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

app.get('/image',function(req, res){
    var imageurl = '', location = req.query.location, statuscode, data
    switch(location){
        case 'Chennai':
            imageurl = CHENNAI_URL
            break;
        case 'Tokyo':
            imageurl = TOKYO_URL
            break;
        case 'London':
            imageurl = LONDON_URL
            break;
        case 'California':
            imageurl = CALIFORNIA_URL
            break;
        case 'Moscow':
            imageurl = MOSCOW_URL
            break;
        case 'Sydney':
            imageurl = SYDNEY_URL
            break;
        default:
            imageurl = ''
    }
    if(imageurl === ''){
        console.log('Failure')
        statuscode = 404
        data = {
            url: null,
            error: 'Image url cannot be fetched'
        }
    } else {
        console.log('Success')
        statuscode = 200
        data = {
            url : imageurl,
            error: null
        }
    }
    res.setHeader('Content-Type', 'application/json');
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.status(statuscode)
    res.send(data)
});

app.get('/weather', getweatherdetails);

async function getweatherdetails(req,res){

    var cityName = req.query.location,
        data, 
        statuscode=200, 
        url = 'https://api.openweathermap.org/data/2.5/weather?appid=150c3f1c28b9ca7f046df31e5209968c&q='+cityName
    console.log('before await')
    const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    };
    const axiosData = await axios.get(url,headers).catch(function(err){
        console.log('Promise err => ',err.Error);
    });
    const resData = axiosData.data;
    if(axiosData.data && axiosData.data.cod === 200 && resData.main){
        var finalTemp, finalHumid
        // Temperature
        var temp = tuc.k2c(resData.main.temp).toFixed(1)
        var newTemp = new tuc.Temperature(temp, 'C');
        finalTemp = newTemp.temp + '' + newTemp.unit.nameShort
        // Humidity
        finalHumid = resData.main.humidity + '%'
        data = {
            temp : finalTemp,
            humidity : finalHumid,
            error: null
        };
        statuscode = 200
        console.log('inside data => ', data)
    } else {
        data = {
            temp : null,
            humidity : null,
            error: 'Data not available !'
        };
        statuscode = 404
        console.log('inside error data => ', data)
    }
    
    console.log('after await')
    res.setHeader('Content-Type', 'application/json');
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.status(statuscode)
    res.send(data)
}
app.post('/feedback', function(req,res){
    
    var body = req.body,text, status
    console.log('req.body => ',req.body)
    
    if(body.liked === 'true'){
        text = 'Thanks ! Cool that you liked the details of ' + body.cityName + ' :)';
        status = 200;
    } else {
        text = 'We are sorry for the bad experience ! Will try to give better details of ' + body.cityName + ' :(';
        status = 200;
    }
    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    console.log('text => ',text)
    res.status(status)
    res.send(text)
});
app.listen(3333, () => {
    console.log('Now listening to request on port 3333 !!!')
});