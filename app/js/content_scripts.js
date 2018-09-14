// 登录页面
let loginUrlArr = ['http://aqgl.crcc.cn/login.do?reqCode=init',
    'http://aqgl.crcc.cn/login.do?reqCode=logout'];

let cfg = {
    crcctitle: "某铁辅助插件",
    crccBaseUrl: "http://crcc.mcourse.cc",
    // crccBaseUrl: "http://127.0.0.1:3100",
};

$().ready(function () {
    initPage();
});

/**
 * 初始化页面
 */
function initPage() {
    // 当前页面的url
    let currentUrl = window.location.href;

    if (loginUrlArr.indexOf(currentUrl) !== -1) {
        // 登录
        renderLogin()
    } else if (currentUrl.indexOf('http://aqgl.crcc.cn/index.do?reqCode=indexInit') !== -1) {
        // init页面, 打开填报窗口
        window.open('http://aqgl.crcc.cn/safequality/troubledvr.do?reqCode=troubledvrWriteInit1&menuid4Log=01050501');
    } else if (currentUrl.indexOf('http://aqgl.crcc.cn/safequality/troubledvr.do?reqCode=troubledvrWriteInit1&menuid4Log=01050501') !== -1) {
        // 隐患填报页面
        renderSubmit();
    }

}

function renderPluginJS() {
    $plugin_js = $(`
        <script>
            window.cfg = {
                crcctitle: '${cfg.crcctitle}',
                crccBaseUrl: '${cfg.crccBaseUrl}'
            }
        </script>
        <link rel="stylesheet" href="//cdnjs.loli.net/ajax/libs/mdui/0.4.1/css/mdui.min.css">
        <script src="//cdnjs.loli.net/ajax/libs/mdui/0.4.1/js/mdui.min.js"></script>
        <script src="${cfg.crccBaseUrl}/web/static/js/knuth-shuffle.js"></script>
        <script src="${cfg.crccBaseUrl}/web/static/js/dateutils.js"></script>
        <script src="${cfg.crccBaseUrl}/web/static/js/storageutils.js"></script>
        <script src="${cfg.crccBaseUrl}/web/static/js/draggabilly.pkgd.min.js"></script>
        <link rel="stylesheet" href="${cfg.crccBaseUrl}/web/static/crcc/plugin_crcc.css">
        <script src="${cfg.crccBaseUrl}/web/static/crcc/plugin_common.js" async></script>
        `);

    return $plugin_js;
}

/**
 * 渲染登录页面
 */
function renderLogin() {
    // ===========================================================
    // 登录页面
    // ===========================================================
    let $plugin_pop = $(`
        <div id="plugin_pop" class="mdui-container mdui-text-color-black-text mdui-shadow-18">
            <div class="mdui-typo-title-opacity mdui-text-color-blue-900 mdui-m-y-1 handle">${cfg.crcctitle}</div>
            <div>
                <button class="mdui-btn mdui-btn-dense mdui-btn-block mdui-color-red mdui-ripple margin-tb-5" onclick="testCrccAgent()">
                    确定服务器运行状态
                </button>
                <div class="mdui-textfield">
                    <label class="mdui-textfield-label">授权邮箱</label>
                    <input class="mdui-textfield-input" type="text" id="cp_email" value="" placeholder="请输入您的授权邮箱"/>
                </div>
                <button class="mdui-btn mdui-btn-dense mdui-btn-block mdui-color-green mdui-ripple margin-tb-5" onclick="loginOnekey()">
                    一键登录
                </button>
            </div>
            <div id="tips"></div>
            <!-- 自定义弹出框 -->
            <div class="mdui-dialog" id="customLoading">
                <div class="mdui-dialog-title"></div>
                <div class="mdui-dialog-content">
                    <div class="mdui-progress">
                        <div class="mdui-progress-indeterminate"></div>
                    </div>
                    <div class="customContent"></div>
                </div>
            </div>
        </div>
        <script src="${cfg.crccBaseUrl}/web/static/crcc/plugin_login.js" async></script>`);

    dosthDelay(function () {
        // 追加弹窗
        $("body").append(renderPluginJS());
        dosthDelay(function () {
            // 追加弹窗
            $("body").append($plugin_pop);
        }, 0.3);
    }, 0.3);
}

/**
 * 渲染提交数据页面
 */
function renderSubmit() {
    // ===========================================================
    // 提交数据页面
    // ===========================================================
    let $plugin_pop = $(`
        <div id="plugin_pop" class="mdui-container mdui-text-color-black-text mdui-shadow-18">
            <div class="mdui-typo-title-opacity mdui-text-color-blue-900 mdui-m-y-1 handle">${cfg.crcctitle}</div>
            <div>
                <button class="mdui-btn mdui-btn-dense mdui-btn-block mdui-color-red mdui-ripple margin-tb-5" onclick="testCrccAgent()">
                    确定服务器运行状态
                </button>
                <button class="mdui-btn mdui-btn-dense mdui-btn-block mdui-color-blue mdui-ripple margin-tb-5" onclick="syncCrccDataOnekey()">
                    一键同步数据
                </button>
                <button class="mdui-btn mdui-btn-dense mdui-btn-block mdui-color-blue mdui-ripple margin-tb-5" onclick="initCrccDataOnekey()">
                    一键初始化数据
                </button>
                <button class="mdui-btn mdui-btn-dense mdui-btn-block mdui-color-green mdui-ripple margin-tb-5" onclick="submitDataOneKey()">
                    <i class="mdui-icon material-icons">check</i>一键填报隐患
                <button class="mdui-btn mdui-btn-dense mdui-btn-block mdui-color-purple mdui-ripple margin-tb-5" onclick="deldangerOnekey()">
                    <i class="mdui-icon material-icons">clear</i>一键消除隐患
                </button>
                <button class="mdui-btn mdui-btn-dense mdui-btn-block mdui-color-grey mdui-ripple margin-tb-5" onclick="plugin_logout()">
                    一键注销
                </button>
            </div>
            <div id="tips"></div>
            <!-- 自定义弹出框 -->
            <div class="mdui-dialog" id="customLoading">
                <div class="mdui-dialog-title"></div>
                <div class="mdui-dialog-content">
                    <div class="mdui-progress">
                        <div class="mdui-progress-indeterminate"></div>
                    </div>
                    <div class="customContent"></div>
                </div>
            </div>
        </div>
        <script src="${cfg.crccBaseUrl}/web/static/crcc/plugin_submit.js" async></script>
        <script src="${cfg.crccBaseUrl}/web/static/crcc/plugin_rmdanger.js" async></script>
        `);

    // 点击新增
    dosthDelay(function () {
        // 新增按钮
        $("#ext-gen36").click();

        dosthDelay(function () {
            // 追加弹窗
            $("body").append(renderPluginJS());
            dosthDelay(function () {
                $("body").append($plugin_pop);
            }, 0.5);
        }, 0.3);
    }, 0.3);
}


/**
 * 获取随机数
 * @param min 最小值
 * @param max 最大值
 */
function getRandom(min, max) {
    return (Math.random() * (max - min) + min).toFixed(0);
}

/**
 * 获取随机数
 * @param min 最小值
 * @param max 最大值
 */
function getRandomInt(min, max) {
    return (Math.random() * (max - min) + min).toFixed(0) * 1;
}


/**
 * 延迟执行函数
 * @param fn 要执行的函数
 * @param delay 延迟的最小秒数
 */
function dosthDelay(fn, delay) {
    let min = delay || 1;
    let max = delay + 1;
    setTimeout(fn, getRandom(min * 1000, max * 1000));
}