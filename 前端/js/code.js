/**
 * 获取页面URL中参数
 * @param  {String} name 参数名
 * @return {String}      参数值
 */
function getUrlParam(name) {
    let value = window.location.search.match(new RegExp('[?&]' + name + '=([^&]*)(&?)', 'i'));
    return value ? decodeURIComponent(value[1]) : '';
}

/**
 * 返回当前日期或指定日期
 * @param  {Number} addDateCount 距今日的天数
 * @return {String|*}
 */
function getCurDate(addDateCount) {
    var date = new Date();

    if (typeof addDateCount !== 'undefined') {
        date.setDate(date.getDate() + addDateCount);
    }

    var year = date.getFullYear(),
        month = date.getMonth() + 1,
        day = date.getDate(),
        curDate;

    month = month > 9 ? month : '0' + month;
    day = day > 9 ? day : '0' + day;
    curDate = year + "-" + month + "-" + day;

    return curDate;
}

/**
 * 返回当前日期时间
 * @return {string|*}
 */
function getCurDatetime() {
    var date = new Date(),
        year = date.getFullYear(),
        month = date.getMonth() + 1,
        day = date.getDate(),
        hour = date.getHours(),
        minute = date.getMinutes(),
        second = date.getSeconds(),
        curDate;

    month = month > 9 ? month : '0' + month;
    day = day > 9 ? day : '0' + day;
    hour = hour > 9 ? hour : '0' + hour;
    minute = minute > 9 ? minute : '0' + minute;
    second = second > 9 ? second : '0' + second;
    curDate = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;

    return curDate;
}

/**
 * 获取元素相对页面绝对位置
 * @param  {} elem [description]
 * @return {[type]}      [description]
 */
function getAbsPosition(elem) {
    if (!elem) {
        return {};
    }

    var left = elem.offsetLeft,
        top = elem.offsetTop;

    while (elem = elem.offsetParent) {
        left += elem.offsetLeft;
        top += elem.offsetTop;
    }

    return {
        left,
        top
    };
}

/**
 * Handlerbars模版编译
 * @param  {String} html 编译源
 * @param  {Object} data 数据
 * @return {String}      编译结果
 */
function getHtml(html, data) {
    let source = Handlebars.compile(html);
    let content = source(data);
    return content;
}

/**
 * 阻止鼠标右击事件
 */
function stopContextMenu() {
    $(document)
        .on('contextmenu', (e) => {
            e.preventDefault();
        }).on('keydown keyup keypress', (e) => {
            // F12
            if (window.event.keyCode === 123) {
                window.event.returnValue = false;
                return false;
            }
        });
}

/**
 * 字符串转换为HTML实体符
 * @param  {[type]} str [description]
 * @return {[type]}     [description]
 */
function replace2HTMLEntity(str) {
    if (!str) {
        return str;
    }

    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * HTML实体符替换为字符串
 * @param  {[type]} str [description]
 * @return {[type]}     [description]
 */
function replaceHTMLEntity(str) {
    if (!str) {
        return str;
    }

    return str.replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#039;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&');
}

// 根据页面是否有滚动条，调整脚注是否固定于页面下方
function adjustFooterPosition() {
    let cHeight = document.documentElement.clientHeight,
        oHeight = document.documentElement.offsetHeight,
        sHeight = document.documentElement.scrollHeight,
        $footer = $('footer'),
        footerHeight = $footer[0].offsetHeight;

    // 没有滚动条
    if (sHeight === cHeight) {
        // 将脚注直接置于页面尾部，判断是否会出现滚动条
        if (cHeight - oHeight >= footerHeight) {
            $footer.addClass('fixed-bottom');
        } else {
            $footer.removeClass('fixed-bottom');
        }
    }
    // 有滚动条
    else {
        $footer.removeClass('fixed-bottom');
    }
}

// 函数节流，频繁操作中间隔 delay 的时间才处理一次
function throttle(fn, delay) {
    delay = delay || 200;

    var timer = null;
    // 每次滚动初始的标识
    var timestamp = 0;

    return function () {
        var arg = arguments;
        var now = Date.now();

        // 设置开始时间
        if (timestamp === 0) {
            timestamp = now;
        }

        clearTimeout(timer);
        timer = null;

        // 已经到了delay的一段时间，进行处理
        if (now - timestamp >= delay) {
            fn.apply(this, arg);
            timestamp = now;
        }
        // 添加定时器，确保最后一次的操作也能处理
        else {
            timer = setTimeout(function () {
                fn.apply(this, arg);
                // 恢复标识
                timestamp = 0;
            }, delay);
        }
    }
}

// 函数节流，频繁操作中不处理，直到操作完成之后（再过 delay 的时间）才一次性处理
function debounce(fn, delay) {
    delay = delay || 200;

    var timer = null;

    return function () {
        var arg = arguments;

        // 每次操作时，清除上次的定时器
        clearTimeout(timer);
        timer = null;

        // 定义新的定时器，一段时间后进行操作
        timer = setTimeout(function () {
            fn.apply(this, arg);
        }, delay);
    }
}

/**
 * Ajax异步请求，更新浏览器url地址，设置浏览器历史记录，支持前进后退刷新
 * 异步请求数据成功后，即可调用此方法
 * @param  {Object|...Any}  data             需要存储的数据
 * @param  {String}         title            新的url页的头title标识（目前浏览器会直接忽略）
 * @param  {String}         url              新的url标识
 * @param  {Function}       popstateCallback 浏览器前进后退操作触发的回调
 */
function historyStateWithAjax(data, title, url, popstateCallback) {
    // 存储的数据集
    var state = {
        data: data,
        title: title,
        url: url
    };

    // 异步请求成功后，存储历史记录状态值，更新title与url
    window.history.pushState && window.history.pushState(state, state.title, state.url);

    // 浏览器前进后退
    window.onpopstate = function () {
        var state = window.history.state;

        if (!state) {
            return;
        }

        // 前进后退 -- 更新页面数据
        try {
            popstateCallback(state);
        } catch (e) {

        }

        // 前进后退 -- 更新历史记录状态值，更新title与url
        window.history.replaceState && window.history.replaceState(state, state.title, state.url);
    };
}

/**
 * Ajax异步请求,支持不带数据
 * @param  {String}         title            新的url页的头title标识（目前浏览器会直接忽略）
 * @param  {String}         url              新的url标识
 */
function historyStateWithAjaxNoData(title, url) {
    var state = {
        title: title,
        url: url
    };

    window.history.pushState && window.history.pushState(state, state.title, state.url);
}

function popState(popstateCallback) {
    window.onpopstate = function () {
        var state = {
            title: document.title,
            url: window.location.href
        };

        window.history.replaceState && window.history.replaceState(state, document.title, window.location.href);

        popstateCallback && popstateCallback();
    };
}

/**
 * 瀑布流布局自适应排列模块
 * @return {[type]} [description]
 */
function waterfall() {
    $('.info-module__items').each(function () {
        let $items = $(this).find('.info-module__item'),
            itemWidth = $items.eq(0).outerWidth(true),
            // 列高组
            colHeight = [0, 0],
            // 列坐标
            colIndex = 0;

        $items.each(function () {
            let $this = $(this),
                // 取高度最小的列，在这一列中置入此项
                minHeight = Math.min.apply(null, colHeight);

            colIndex = colHeight.indexOf(minHeight);

            $this.css({
                left: colIndex * itemWidth,
                top: minHeight
            });

            colHeight[colIndex] += $this.outerHeight(true);
        });

        $(this).css('height', Math.max.apply(null, colHeight));
    });
}

/**
 * 更新需要懒加载的模块数据
 * @return {[type]} [description]
 */
function updateLoadModules() {
    $container.find('.info-module__item').each(function () {
        let $this = $(this),
            pos = getAbsPosition(this);

        if ($this.hasClass('info-module__item--loading') || $this.hasClass('info-module__item--loaded')) {
            return;
        }

        // 存储初始模块位置
        loadModules.push({
            $item: $this,
            top: pos.top || 0,
            bottom: (pos.top + this.offsetHeight) || 0
        });
    });
}

/**
 * 滚动触发加载的执行程序
 * @return {[type]} [description]
 */
function loadModule() {
    let st = document.documentElement.scrollTop || document.body.scrollTop,
        clientHeight = document.documentElement.clientHeight;

    loadModules.forEach(item => {
        if (item.$item.hasClass('info-module__item--loading') || item.$item.hasClass('info-module__item--loaded')
            || (st + clientHeight) < item.top || st > item.bottom) {
            return;
        }

        item.$item.removeClass('info-module__item--wait-load');
        item.$item.addClass('info-module__item--loading');

        getModuleContent(item.$item);
    });
}

// 子元素滚动 父元素容器不跟随滚动
$.fn.scrollUnique = function () {
    return $(this).each(function () {
        var eventType = 'mousewheel';
        // 火狐是DOMMouseScroll事件
        if (document.mozHidden !== undefined) {
            eventType = 'DOMMouseScroll';
        }
        $(this).on(eventType, function (event) {
            // 一些数据
            var scrollTop = this.scrollTop,
                scrollHeight = this.scrollHeight,
                height = this.clientHeight;

            var delta = (event.originalEvent.wheelDelta) ? event.originalEvent.wheelDelta : -(event.originalEvent.detail || 0);

            if ((delta > 0 && scrollTop <= delta) || (delta < 0 && scrollHeight - height - scrollTop <= -1 * delta)) {
                // IE浏览器下滚动会跨越边界直接影响父级滚动，因此，临界时候手动边界滚动定位
                this.scrollTop = delta > 0 ? 0 : scrollHeight;
                // 向上滚 || 向下滚
                event.preventDefault();
            }
        });
    });
};


// 返回顶部
$(document)
    .on('click', '.page-go-top', function () {
        window.clickAndScrolling = true;

        $('html, body').animate({
            scrollTop: 0
        }, 400, () => {
            window.clickAndScrolling = false;
        });
    })

$(window).scroll(function () {
    if ((document.documentElement.scrollTop || document.body.scrollTop) <= 0) {
        $('.page-go-top').removeClass('visible');
    } else {
        $('.page-go-top').addClass('visible');
    }
});

// 图片加载出错则使用默认图  已存在的图片
$('img[data-default]').each(function () {
    let img = new Image();

    img.onerror = function () {
        console.log('error', this.src);
        this.src = this.getAttribute('data-default');
    }.bind(this);

    img.src = this.src;
})

// 图片加载出错则使用默认图 未存在的图片
document.body.addEventListener('error', function (e) {
    if (e.target.tagName === 'IMG') {
        let defaultSrc = e.target.getAttribute('data-default');

        if (defaultSrc) {
            console.log("error", e.target.src);
            e.target.src = defaultSrc;
        }
    }
}, true);


/**
 * 页面滚动时 跟进滚动到的位置 导航的锚点自动定位
 * @return {[type]} [description]
 */
function scrollBannerAnchor() {
    let anchors = [];

    $('.banner a').each(function() {
        let $this = $(this);

        if ($this.attr('href') === 'javascript:;') {
            return;
        }

        let id = $this.attr('href').slice(1),
            $target = $(`#${id}`);

        $target.is(':visible') && $target.length && anchors.push({
            $anchor: $this,
            offsetTop: $target[0].offsetTop
        });
    });

    $(document).on('scroll', function() {
        let t = document.scrollingElement.scrollTop;

        anchors.forEach(item => {
            if (t >= item.offsetTop) {
                item.$anchor.addClass('active')
                    .closest('li').siblings().find('a').removeClass('active');
            }
        });
    });
}

/**
 * 获取最近的五分钟 取整
 * @param  {[type]} d [description]
 * @return {[type]}   [description]
 */
function getCeil5Minutes(d) {
    var time = 1000 * 60 * 5,
        curDate = d || +new Date(),
        addTime = 1000 * 60 * 2.5,
        addDate = new Date(curDate + addTime),
        date = new Date(Math.round(addDate / time) * time);

     return getDateTime(date, true);
}

/**
 * 替换javascript伪协议中的冒号
 * @param  {[type]} str [description]
 * @return {[type]}     [description]
 */
function replaceJavascriptScheme(str) {
    if (!str) {
        return '';
    }

    return str.replace(/:/g, encodeURIComponent(':'));
}

/**
 * 包装URL，防止xss
 * @param  {[type]} url) {               url [description]
 * @return {[type]}      [description]
 */
Handlebars.registerHelper('generateURL', function (url) {
    url = Handlebars.Utils.escapeExpression(url);

    if (!url) {
        return '';
    }

    var schemes = ['//', 'http://', 'https://'];
    var schemeMatch = false;

    schemes.forEach(function(scheme) {
        if (url.slice(0, scheme.length) === scheme) {
            url = scheme + replaceJavascriptScheme(url.slice(scheme.length));
            schemeMatch = true;
            return false;
        }
    });

    return schemeMatch ? url : '//' + replaceJavascriptScheme(url);
});

/**
 * 获取带格式的日期
 * @param  {[type]} text    [description]
 * @param  {Date}   format) {               var date [description]
 * @return {[type]}         [description]
 */
Handlebars.registerHelper('date_format', function (text, format) {
    var date = new Date(text == parseInt(text) ? parseInt(text) * 1000 : text)

    var data = {
        year: date.getFullYear(),
        year_short: date.getYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
        hour: date.getHours(),
        minute: date.getMinutes(),
        second: date.getSeconds()
    }

    var addZero = function (num) {
        num = parseInt(num)
        return num > 9 ? num : '0' + num
    }

    format = typeof format == 'object' ? 'yyyy-mm-dd' : format
    format = format
        .replace(/yyyy/g, data['year'])
        .replace(/yy/g, data['year_short'])

        .replace(/mm/g, addZero(data['month']))
        .replace(/m/g, data['month'])

        .replace(/dd/g, addZero(data['day']))
        .replace(/d/g, data['day'])

        .replace(/hh/g, addZero(data['hour']))
        .replace(/h/g, data['hour'])

        .replace(/ii/g, addZero(data['minute']))
        .replace(/i/g, data['minute'])

        .replace(/ss/g, addZero(data['second']))
        .replace(/s/g, data['second'])

    return format
})

// 数字每三位逗号分隔
Handlebars.registerHelper('thousandCut', function(v) {
    if (!v && v !== 0) {
        return '';
    }

    v = Number(v).toFixed(2);

    return v.toString().replace(/^\d+/, function(v) {
        return v.replace(/\d{1,3}(?=(\d{3})+$)/g, function(s) {
            return s + ','
        });
    });
})


// 客户端socket连接
var socket;

connectWS($('.gwrap').attr('data-ws'));

function connectWS(domain) {
    socket = new WebSocket(domain);

    socket.onerror = function (e) {
        // console.log('ws error')
    };

    // 端口重连
    socket.onclose = function () {
        // console.log('ws close');
        setTimeout(function () {
            connectWS(domain);
        }, 2000);
    };

    socket.onopen = function () {
        // console.log('open');

        // 客户端ID绑定
        socket.send(JSON.stringify({
            type: 'bingSomething',
            id: $('.wrap').attr('data-id')
        }));
    };

    // 监听新消息到达 解析
    socket.onmessage = function (e) {
        // 不同消息种类进行解决
        var data;

        try {
            data = parseJSON(e.data);
        } catch (e) {
            data = e.data;
        }

        if (!data) {
            return;
        }

        var type = data.type;

        // 一些处理
    };
}

// 发送消息
socket.send(JSON.stringify({
    type: 'set',
    id: '...'
}));
