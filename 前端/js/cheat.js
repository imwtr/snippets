

/**
 * 检测作弊
 */
let detectCheatTimeID;

function detectCheat(noWait) {
    if (noWait) {
        $(window).on('blur', (e)=> {
            myBlur(e);
        });

        return;
    }

    detectCheatTimeID = setTimeout(()=> {
        $(window).on('blur', (e)=> {
            myBlur(e);
        });
    }, 10 * 1000);
}

/**
 * 鼠标失去焦点事件
 * @param {Object} e 事件
 */
function myBlur(e) {

    let blur = true;
    e = e || window.event;
    if (e) {
        let x = e.clientX;
        let y = e.clientY;
        let w = document.body.clientWidth;
        let h = document.body.clientHeight;
        if (x > 0 && x < w && y > 0 && y <= h) {
            blur = false;
        }
    }

    if (document.activeElement.tagName == 'IFRAME' || $(document.activeElement).attr('type') == 'file' || $(document.activeElement).is('.the-btn')) {
        blur = false;
    }

    if (blur) {
        let blurTime = new Date();
        let examPaperID = getUrlParam('id');
        $(window).on('mouseenter', (e)=> {
            let jumpTime = Math.floor((new Date() - blurTime) / 1000);
            $(window).off('mouseenter');
            ajaxData('..cheat', function (rs) {
                layer.alert(`不要切换到其他页面！`);
            }, 'POST', {
                jumpTime
            });
        });
    }
}
