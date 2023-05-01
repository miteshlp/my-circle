const moment = require("moment");

module.exports = {
    format: function (element) {
        const val = moment(element).format('MMMM Do, YYYY');
        return val;
    },
    now: function () {
        const val = (moment().format('LLLL'));
        // const val = moment(Date.now()).format('MMMM Do, YYYY');
        return val;
    },
    afterPoint: function (number) {
        // return Math.round(number*100)/100;
        return number.toFixed(2);
    },
    capital: function (str) {
        let str1, str2;
        if (str.length > 30) {
            str1 = str.slice(0, 30).concat(" ...");
            str2 = str1.charAt(0).toUpperCase() + str1.slice(1);
            return str2;
        }
        return str.charAt(0).toUpperCase() + str.slice(1);
    },
    pagination: function (func, obj) {
        let html = ``;
        let range = [obj.currentPage - 1, obj.currentPage, obj.currentPage + 1];
        if (obj.previousePage == 0) {
            html = html.concat(`<li class="page-item disabled"><a class=page-link href=javascript:void(0) onclick=${func}(${obj.previousePage});>Previous</a></li>`);
        } else {
            html = html.concat(`<li class="page-item"><a class=page-link href=javascript:void(0) onclick=${func}(${obj.previousePage});>Previous</a></li>`);
        }

        for (let i = 0; i < obj.pageShow; i++) {
            if (range[i] > 0 && range[i] <= obj.totalpage) {
                if (range[i] == obj.currentPage) {
                    html = html.concat(`&nbsp;&nbsp;<li class="page-item active"><a class=page-link href=javascript:void(0)
                    onclick=${func}(${range[i]});>${range[i]}</a></li>`);
                }
                else {
                    html = html.concat(`&nbsp;&nbsp;<li class="page-item"><a class=page-link href=javascript:void(0)
                    onclick=${func}(${range[i]});>${range[i]}</a></li>`);
                }
            }
        }

        if (obj.currentPage >= obj.totalpage) {
            html = html.concat(`&nbsp;&nbsp;<li class="page-item disabled"><a class=page-link href=javascript:void(0)
            onclick=${func}(${obj.nextPage});>Next</a></li>`);
            return html;
        }
        html = html.concat(`&nbsp;&nbsp;<li class=page-item><a class=page-link href=javascript:void(0)
        onclick=${func}(${obj.nextPage});>Next</a></li>`);
        return html;
    }
    // cr-1 , i =0,pageshow=3 ,totalpage =2
}