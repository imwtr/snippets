
// 字符串常用操作
define([], function() {

    /**
     * xss防范数据过滤
     * @param  {String} str  要过滤的数据
     * @param  {String} type 要过滤的类型（规则）
     * @return {String}      过滤后的数据
     */
    var xss = function(str, type) {
        // 空过滤
        if (!str) {
            return str === 0 ? '0' : '';
        }

        switch (type) {
            case 'none': // 过度方案
                return '' + str;
                break;

            case 'html': // 过滤html字符串中的xss
                return str.replace(/[&'"<>\/\\\-\x00-\x09\x0b-\x0c\x1f\x80-\xff]/g, function(r){
                    return '&#' + r.charCodeAt(0) + ';';
                }).replace(/ /g, '&nbsp;').replace(/\r\n/g, '<br />').replace(/\n/g,'<br />').replace(/\r/g,'<br />');
                break;

            case 'htmlEp': // 过滤DOM节点属性中的XSS
                return str.replace(/[&'"<>\/\\\-\x00-\x1f\x80-\xff]/g, function(r){
                    return '&#' + r.charCodeAt(0) + ';';
                });
                break;

            case 'url': // 过滤url
                return escape(str).replace(/\+/g, '%2B');
                break;

            case 'miniUrl':
                return str.replace(/%/g, '%25');
                break;

            case 'script':
                return str.replace(/[\\"']/g, function(r){
                    return '\\' + r;
                }).replace(/%/g, '\\x25').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\x01/g, '\\x01');
                break;

            case 'reg':
                return str.replace(/[\\\^\$\*\+\?\{\}\.\(\)\[\]]/g, function(a){
                    return '\\' + a;
                });
                break;

            default:
                return escape(str).replace(/[&'"<>\/\\\-\x00-\x09\x0b-\x0c\x1f\x80-\xff]/g, function(r){
                    return '&#' + r.charCodeAt(0) + ';';
                }).replace(/ /g, '&nbsp;').replace(/\r\n/g, '<br />').replace(/\n/g,'<br />').replace(/\r/g,'<br />');
                break;
        }
    };

    /**
     * 字符串替换
     * @param  {String}         str 要进行替换的数据
     * @param  {Object|String}  re  替换的规则(规则对象或用于单个规则)
     * @param  {String}         rt  用于替换的单个规则，与re成对使用
     * @return {String}             替换后的数据
     */
    var strReplace = function(str, re, rt) {
        if (rt != undefined) {
            replace(re, rt);
        } else {
            for (var key in re) {
                replace(key, re[key]);
            }
        }

        // 使用给定规则进行替换
        function replace(a, b) {
            var arr = str.split(a);
            str = arr.join(b);
        }

        return str;
    };

    /**
     * HTML解码
     * @param  {String} content 要解码的数据
     * @return {String}         解码后的数据
     */
    var decodeHtml = function(content) {
        if (content == null) {
            return '';
        }

        return strReplace(content, {
            "&amp;" : '&',
            "&quot;" : '\"',
            "\\'" : '\'',
            "&lt;" : '<',
            "&gt;" : '>',
            "&nbsp;" : ' ',
            "&#39;" : '\'',
            "&#09;" : '\t',
            "&#40;" : '(',
            "&#41;" : ')',
            "&#42;" : '*',
            "&#43;" : '+',
            "&#44;" : ',',
            "&#45;" : '-',
            "&#46;" : '.',
            "&#47;" : '/',
            "&#63;" : '?',
            "&#92;" : '\\',
            "<BR>" : '\n'
        });
    };

    return {
        xss: xss,
        strReplace: strReplace,
        decodeHtml: decodeHtml
    };

});
