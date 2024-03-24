const axios = require("axios");
var n=0;
const month = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const d = new Date();
var year = d.getFullYear();

function getmonthFunc(no) {
    return new Promise((resolve, reject) => {
        if(no=="up"){
            n=n-1;
        }
        if(no=="down"){
            n=n+1;
        }
        
        
        if(d.getMonth()+n<0){
            year-=1;
            n=11-d.getMonth();
            
        }else if(d.getMonth()+n>11){
            year+=1;
            n=-d.getMonth();
        }

        let name = month[d.getMonth()+n];
        axios.get("https://calendar-json-app.adaptable.app/month/"+name+`?year=${year}`)
            .then((response) => {
                resolve(response.data);
            })
            .catch((err) => {
                reject(err);
            });
    });
}

module.exports = { getmonthFunc };