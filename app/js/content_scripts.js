console.log('content_scripts.js run');

let currentUrl = '';

// 登录页面
let loginUrlArr = ['http://aqgl.crcc.cn/login.do?reqCode=init',
    'http://aqgl.crcc.cn/login.do?reqCode=logout'];
let cfg = {
    crcctitle: "中铁辅助插件",
    crccBaseUrl: "http://127.0.0.1:3100",
    cp_genGroupNum: -1,// 生成数据组数限制
    cp_pagesize: 20,// 每组提交20条记录
    cp_totalpage: 25,// 每次提交25组
    cp_tipsLength: 10,// 消息堆栈长度
    solution: ["立即将存在的隐患问题进行处理，确保施工生产正常进行。", "及时将发现的隐患问题进行整改，以减少安全事故的发生。"],// 解决方案
};
// 隐患级别--- 1 一般隐患；2 重大隐患
cfg.dangerlevel = [1, 2];
// 危机人数分类--- 1 1-2人；2 3-9人；3：10-29人 4：30人以上
cfg.peoplecount = [1, 2, 3, 4];
// 天气因素-- ['1', '风']['2', '雨']['3', '干燥']['4', '雷电']['5', '冻融']['8', '雾霾']['9', '冰雪']['10', '高温']['13', '其他']['14', '正常']
cfg.weatherid = [1, 2, 3, 4, 5, 8, 9, 10, 13, 14];
// 因素分类--- ['1', '人']['2', '物']['3', '管理']['4', '机械']['5', '环境']
cfg.belongsort = [1, 2, 3, 4, 5];
// 施工现场--- ['1', '营区']['2', '施工现场']['3', '其它']
cfg.place = [1, 2, 3];
// 高新技术--- ['1', '无']['2', '新技术']['3', '新工艺']['4', '新材料']['5', '新设备']
cfg.fntech = [1, 2, 3, 4, 5];
// 路内路外--- ['1', '路内']['2', '路外']
cfg.inoutroad = [1, 2];


$().ready(function () {
    console.log('jquery ready');
    currentUrl = window.location.href;

    if (loginUrlArr.indexOf(currentUrl) !== -1) {
        // 登录
        renderLogin()
    } else if (currentUrl === 'http://aqgl.crcc.cn/index.do?reqCode=indexInit') {
        // init页面, 跳转到填报页面
        window.open('http://aqgl.crcc.cn/safequality/troubledvr.do?reqCode=troubledvrWriteInit1&menuid4Log=01050501');
    } else if (currentUrl === 'http://aqgl.crcc.cn/safequality/troubledvr.do?reqCode=troubledvrWriteInit1&menuid4Log=01050501') {
        // 填报页面
        renderSubmit();
    }
})

function renderPluginJS() {
    $plugin_js = $(`
        <script>
            window.cfg = {
               crccBaseUrl: '${cfg.crccBaseUrl}',
               cp_genGroupNum: ${cfg.cp_genGroupNum},
               cp_pagesize: ${cfg.cp_pagesize},
               cp_tipsLength: ${cfg.cp_tipsLength},
               cp_totalpage: ${cfg.cp_totalpage},
               crcctitle: '${cfg.crcctitle}',
               solution: '${cfg.solution}',
            }
        </script>
        <link rel="stylesheet" href="//cdnjs.loli.net/ajax/libs/mdui/0.4.1/css/mdui.min.css">
        <script src="//cdnjs.loli.net/ajax/libs/mdui/0.4.1/js/mdui.min.js"></script>
        <script src="${cfg.crccBaseUrl}/web/static/js/dateutils.js"></script>
        <script src="${cfg.crccBaseUrl}/web/static/js/storageutils.js"></script>
        <script src="${cfg.crccBaseUrl}/web/static/js/draggabilly.pkgd.min.js"></script>
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
                    <input class="mdui-textfield-input" type="text" id="email" value="18166748035@163.com" placeholder="18166748035@163.com"/>
                </div>
                <button class="mdui-btn mdui-btn-dense mdui-btn-block mdui-color-green mdui-ripple margin-tb-5" onclick="plugin_submit()">
                    登录
                </button>
            </div>
            <div id="tips"></div>
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
                <button class="mdui-btn mdui-btn-dense mdui-btn-block mdui-color-blue mdui-ripple margin-tb-5" onclick="syncYinhuanNodes()">
                    同步隐患节点数据
                </button>
                <button class="mdui-btn mdui-btn-dense mdui-btn-block mdui-color-green mdui-ripple margin-tb-5" onclick="submitDataOneKey()">
                    一键提交数据
                </button>
                <button class="mdui-btn mdui-btn-dense mdui-btn-block mdui-color-grey mdui-ripple margin-tb-5" onclick="plugin_logout()">
                    一键注销
                </button>
                <button class="mdui-btn mdui-btn-dense mdui-btn-block mdui-color-grey mdui-ripple margin-tb-5" onclick="testTips()">
                    测试Tips
                </button>
            </div>
            <div id="tips"></div>
        </div>
        <script src="${cfg.crccBaseUrl}/web/static/crcc/plugin_submit.js" async></script>
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