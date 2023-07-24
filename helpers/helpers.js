const moment = require("moment");
const marked = require('marked');

function isMarkdownFormatted(str) {
    // Regular expressions for common Markdown patterns
    const headingPattern = /^\s*#+\s+/;
    const unorderedListPattern = /^\s*[-+*]\s+/;
    const orderedListPattern = /^\s*\d+\.\s+/;
    const emphasisPattern = /(\*|_){1,2}.*?(\*|_){1,2}/;
    const linkPattern = /\[.*?\]\(.*?\)/;
    const imagePattern = /!\[.*?\]\(.*?\)/;
    const codeBlockPattern = /^```[\s\S]*?^```/;
    const inlineCodePattern = /`.*?`/;
    const horizontalRulePattern = /^(\*\**)|(-{3,})|(_{3,})$/;
    const blockquotePattern = /^\s*>\s+/;
    const tablePattern = /(\|.*?)+\r?\n\s*\|?-+\|/;

    // Check for each Markdown pattern in the string
    const hasHeading = headingPattern.test(str);
    const hasUnorderedList = unorderedListPattern.test(str);
    const hasOrderedList = orderedListPattern.test(str);
    const hasEmphasis = emphasisPattern.test(str);
    const hasLink = linkPattern.test(str);
    const hasImage = imagePattern.test(str);
    const hasCodeBlock = codeBlockPattern.test(str);
    const hasInlineCode = inlineCodePattern.test(str);
    const hasHorizontalRule = horizontalRulePattern.test(str);
    const hasBlockquote = blockquotePattern.test(str);
    const hasTable = tablePattern.test(str);

    // Return true if any of the Markdown patterns are detected
    return (
        hasHeading ||
        hasUnorderedList ||
        hasOrderedList ||
        hasEmphasis ||
        hasLink ||
        hasImage ||
        hasCodeBlock ||
        hasInlineCode ||
        hasHorizontalRule ||
        hasBlockquote ||
        hasTable
    );
}

module.exports = {
    format: function (element) {
        return moment(element).format('MMMM Do, YYYY');
    },
    tostring: function (element) {
        return element.toString();
    },
    ago: function (element) {
        return moment(element).fromNow();
    },
    now: function () {
        return (moment().format('LLLL'));
        // const val = moment(Date.now()).format('MMMM Do, YYYY');
    },
    markDownFormater: function (mdString) {
        try {
            if (isMarkdownFormatted(mdString)) {
                return marked(mdString);
            }
            return mdString;
        }
        catch (error) {
            console.log(`error :>> `, error);
        }
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
    compareString: function (a, b, options) {
        a = a.toString();
        if (a.toString() === b) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
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