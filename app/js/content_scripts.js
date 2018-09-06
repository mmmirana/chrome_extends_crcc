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
    cp_tipsLength: 3,// 消息堆栈长度
};
let probCfg = {};
// 隐患级别--- 1 一般隐患；2 重大隐患
probCfg.dangerlevel = [1, 2];
// 危机人数分类--- 1 1-2人；2 3-9人；3：10-29人 4：30人以上
probCfg.peoplecount = [1, 2, 3, 4];
// 天气因素-- ['1', '风']['2', '雨']['3', '干燥']['4', '雷电']['5', '冻融']['8', '雾霾']['9', '冰雪']['10', '高温']['13', '其他']['14', '正常']
probCfg.weatherid = [1, 2, 3, 4, 5, 8, 9, 10, 13, 14];
// 因素分类--- ['1', '人']['2', '物']['3', '管理']['4', '机械']['5', '环境']
probCfg.belongsort = [1, 2, 3, 4, 5];
// 施工现场--- ['1', '营区']['2', '施工现场']['3', '其它']
probCfg.place = [1, 2, 3];
// 高新技术--- ['1', '无']['2', '新技术']['3', '新工艺']['4', '新材料']['5', '新设备']
probCfg.fntech = [1, 2, 3, 4, 5];
// 路内路外--- ['1', '路内']['2', '路外']
probCfg.inoutroad = [1, 2];
// 解决方案
probCfg.solution = ["立即将存在的隐患问题进行处理，确保施工生产正常进行。", "及时将发现的隐患问题进行整改，以减少安全事故的发生。"];


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
        <link rel="stylesheet" href="//cdnjs.loli.net/ajax/libs/mdui/0.4.1/css/mdui.min.css">
        <script src="//cdnjs.loli.net/ajax/libs/mdui/0.4.1/js/mdui.min.js"></script>
        <script src="${cfg.crccBaseUrl}/web/static/js/dateutils.js"></script>
        <script src="${cfg.crccBaseUrl}/web/static/js/storageutils.js"></script>
        <script src="${cfg.crccBaseUrl}/web/static/js/draggabilly.pkgd.min.js"></script>
        <script>
        /**
         * post请求
         * @param url
         * @param data
         * @returns {*}
         */
        function cp_get(url, data, dataType) {
            let response = null;
            $.ajax({
                async: false,
                url: url,
                type: 'get',
                data: data,
                dataType: dataType || 'text',
                success: function (rep) {
                    response = rep;
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    tips(true, ''+jqXHR.statusText);
                }
            });
            return response;
        }
        
        /**
         * post请求
         * @param url
         * @param data
         * @returns {*}
         */
        function cp_post(url, data, dataType) {
            let response = null;
            $.ajax({
                async: false,
                url: url,
                type: 'post',
                data: data || {},
                dataType: dataType || 'json',
                success: function (rep) {
                    response = rep;
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    tips(true, ''+jqXHR.statusText);
                }
            });
            return response;
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
         * 解析验证码
         * @param $img
         * @returns {string}
         */
        function resolveCode($img) {
            let base64Img = getBase64Image($img);
            if (!base64Img) return "";
            let codeData = cp_post('${cfg.crccBaseUrl}/common/resolveCode', {base64Img: base64Img});
            if (codeData && codeData.code === 1) {
                return codeData.data;
            } else {
                tips(true, '解析验证码异常：' + JSON.stringify(codeData));
                return "";
            }
        }
        
        function getBase64Image($img) {
            if ($img.length === 0) {
                tips(true, '抱歉，找不到对应的验证码');
                return;
            }
            let img = $img[0];
            let canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            let ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, img.width, img.height);
            let ext = img.src.substring(img.src.lastIndexOf(".") + 1).toLowerCase();
            let dataURL = canvas.toDataURL("image/" + ext);
            return dataURL;
        }
        
        let cp_msgStack=[];
        
        /**
        * 测试心跳接口
        */
        function testCrccAgent(){
            $.ajax({
                url:'${cfg.crccBaseUrl}/crcc/Heartbeat',
                type:'get',
                dataType:"json",
                success:function(data){
                    tips(true, '[ I ]插件服务器正常，请放心进行后续操作！');
                },
                error:function(){
                    tips(true, '[ E ]抱歉，服务器异常，请联系QQ420039341');
                }
            })
        }
        
        /**
        * 提示信息
        * @param showInfo 是否显示在界面上
        * @param msg 信息
        */
        function tips(showInfo, msg){
            console.log(msg);
            if(showInfo){
                if(cp_msgStack.length >= ${cfg.cp_tipsLength || 3}){
                    cp_msgStack.shift();
                };
                cp_msgStack.push(msg);
                $tips = $("#tips");
                if($tips.length>0){
                    let tipsInnnerHtml = cp_msgStack.map(function(v){
                        return "<span>"+v+"</span>";
                    });
                    $tips.html(cp_msgStack.join("<br>"));
                }
            }
        }
        </script>
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
        <script>
        
            let cp_login_num = 0;
        
            $().ready(function(){
                 var $draggable = $('#plugin_pop').draggabilly({
                    // 选项（配置）...
                    containment:true,
                    handle: '.handle',
                    axis: 'y',
                })
            });
        
            function plugin_submit() {
                let configData = cp_post('${cfg.crccBaseUrl}/crcc/getconfig', {
                    email: $("#email").val(),
                });
        
                if (configData && configData.code === 1) {
                    let config = configData.data;
                    plugin_login(config);
                }
            }
        
            
            function plugin_login(config) {
                cp_login_num++;
            
                let sid = config.sid;
                let username = config.username;
                let password = config.password;
                let $img = $("#randImg");
                let validcode = resolveCode($img);
            
                if (validcode && validcode.length === 4) {
                    let loginData = {
                        account: username,
                        password: password,
                        verifycode: validcode
                    };
            
                    let loginResult = cp_post("http://aqgl.crcc.cn/login.do?reqCode=login", loginData);
                    tips(true, '[ I ]正在尝试第 ' + cp_login_num + ' 次登录: ' + JSON.stringify(loginResult));
                    if (loginResult) {
                        //
                        if (loginResult.success === true) {
                            let useridData = {
                                sid: sid,
                                guserid: loginResult.userid,
                            };
            
                            storageutils.set("cp_gusername", username);
                            storageutils.set("cp_guserid", loginResult.userid);
            
                            let updateUseridResult = cp_post('${cfg.crccBaseUrl}/crcc/updateConfigUserid', useridData);
                            tips(false, '[ I ]更新插件服务器数据结果: ' + JSON.stringify(updateUseridResult));
                            tips(true, '[ I ]正在跳转隐患填报页面，请稍后...');
            
                            setTimeout(function () {
                                // window.location.href = "http://aqgl.crcc.cn/safequality/troubledvr.do?reqCode=troubledvrWriteInit1&menuid4Log=01050501";
                                window.location.href = "http://aqgl.crcc.cn/index.do?reqCode=indexInit";
                            }, 1000);
                        } else if (loginResult.success === false) {
                            if (loginResult.errorType === "1") {
                                window.location.href = 'http://aqgl.crcc.cn/login.do?reqCode=logout';
                            } else {
                                // 重新登录
                                $img.click();
                                setTimeout(function () {
                                    plugin_login(config)
                                }, 1000);
                            }
                        }
                    } else {
                        tips(true, '[ E ]中铁服务器异常，请联系当前网站管理员');
                    }
                } else {
                    // 重新登录
                    $img.click();
                    setTimeout(function () {
                        plugin_login(config);
                    }, 1000);
                }
            }
        
        </script>`);

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
            </div>
            <div id="tips"></div>
        </div>
        <script>
        
            // 要初始化的数据
            let unitArr = [];// 获取所有的施工单位
            let genGroupNumber = 0;// 今日已生成的数据
            let submitGroupNumber = 0;// 今日已提交的数据
        
            $().ready(function () {
                var $draggable = $('#plugin_pop').draggabilly({
                    // 选项（配置）...
                    containment:true,
                    handle: '.handle',
                    axis: 'y',
                })
                
                // 获取单位列表
                let unitArrData = cp_post('${cfg.crccBaseUrl}/crcc/getAllUnit',)
                if (unitArrData && unitArrData.code === 1) {
                    unitArr = unitArrData.data;
                } else {
                    tips(true, '[ E ]插件服务器异常：' + JSON.stringify(unitArrData));
                }
        
                initTodayData();
        
            });
            
            /**
            * 一键提交数据
            */
            function submitDataOneKey() {
                let oneKey = true;
                let success = generateTodayData(oneKey);
                if (success) {
                    submitData();
                } else {
                    tips(true, "[ E ]插件服务器生成数据异常，无法提交数据");
                }
            }
        
            // 获取今日提交数据
            function initTodayData() {
                let getSomedayDataResult = cp_post('${cfg.crccBaseUrl}/crcc/getSomedayData', {"date": dateutils.format(new Date(), 'yyyy-MM-dd')});
                if ((getSomedayDataResult.code || 0) === 1) {
                    // 今日已提交数据
                    genGroupNumber = getSomedayDataResult.data.genNumber;
                    submitGroupNumber = getSomedayDataResult.data.submitNumber;
                    return true;
                } else {
                    tips(true, '[ E ]插件服务器异常：' + JSON.stringify(getSomedayDataResult));
                    return false;
                }
            }
        
            /**
             * 将节点同步至本地服务器
             */
            function syncYinhuanNodes() {
                let success = syncYinhuanNodesByNodes();
                tips(true, '[ I ]同步隐患节点数据到插件服务器完成, syncSuccess：' + syncSuccess);
            }
        
            /**
             * 将节点同步至本地服务器
             */
            function syncYinhuanNodesByNodes(pid) {
        
                let syncSuccess = 1;// 默认同步成功
        
                // 获取隐患名称
                let url = "http://aqgl.crcc.cn/safequality/troubledvr.do?reqCode=troubledvrAddTreeInit&troubleSort=000005&opttype=newline";
                let data = {
                    node: pid,
                    loginuserid: '10426838',
                };
                let childNodes = cp_post(url, data);
        
                if (childNodes.length > 0) {
                    // 上传至本地服务器
                    let uploadresult = uploadYinhuanNodes(JSON.stringify(childNodes));
        
                    // 上传成功
                    if ((uploadresult.code || 0) === 1) {
                        for (let j = 0; j < childNodes.length; j++) {
                            let childNode = childNodes[j];
                            if (childNode.id) {
                                syncSuccess *= syncYinhuanNodesByNodes(childNode.id);
                            }
                        }
                    }
                }
        
                return syncSuccess;
            }
        
            /**
             * 上传至服务器
             * @param textJson
             * @returns {SVGElementInstanceList | NodeListOf<Node & ChildNode> | ActiveX.IXMLDOMNodeList}
             */
            function uploadYinhuanNodes(textJson) {
                return cp_post('${cfg.crccBaseUrl}/crcc/updateYinhuanNodes', {textJson: textJson});
            }
        
            /**
             * 校验并提交数据
             */
            function submitData() {
        
                let initFlag = initTodayData();
                if (initFlag === false) {
                    return false;
                }
        
                // 当前要提交的数据
                let remain = 0;
        
                // 要提交数据的总组数
                let cp_totalpage = ${cfg.cp_totalpage};
                if (submitGroupNumber >= cp_totalpage) {
                    remain = prompt('每日计划提交 ' + cp_totalpage + ' 条数据，今日已提交 ' + submitGroupNumber + ' 组数据，再次提交多少组？', '5');
                    remain = parseInt(remain);
                    if (isNaN(remain) || remain === 0) {
                        tips(true, "[ I ]提交数据的操作 已经取消");
                        return;
                    }
                    tips(true, '[ I ]正在继续提交 ' + remain + ' 数据，请稍后...');
                } else {
                    remain = cp_totalpage - submitGroupNumber;
                    tips(true, '[ I ]继续提交剩余 ' + remain + ' 组数组');
                }
        
                let postdataData = cp_post('${cfg.crccBaseUrl}/crcc/getRandomPostData', {itemNumber: remain});
                
                if ((postdataData.code || 0) === 1) {
                    let postdataArr = postdataData.data;
                    let post_index = 0;
                     tips(true, '[ I ]从插件服务器获取到：' + postdataArr.length  +' 组数据，马上为您提交...');
                    submitSingleData(postdataArr, post_index);
                }
            }
        
            /**
             * 遍历提交单条数据
             */
            function submitSingleData(postdataArr, post_index) {
        
                if (post_index < postdataArr.length) {
                    tips(true, '[ I ]正在提交数据 ' + (post_index + 1) + '/' + postdataArr.length);
                    // 要遍历提交的数据
                    let postdata = postdataArr[post_index];
        
                    let postdataObj_sid = postdata.sid;
                    let postdataObj_data = JSON.parse(postdata.data);
        
                    // 2 直接提交
                    submitUploadDataNow(postdataObj_data, function () {
                        let updateReturn = cp_post('${cfg.crccBaseUrl}/crcc/postdataSuccess', {
                            postdata_sid: postdataObj_sid,
                            postdata_status: 3
                        });
        
                        if (updateReturn && updateReturn.code === 1) {
                            tips(true, '[ I ]更新插件服务器数据成功');
                        } else {
                            tips(true, '[ I ]更新插件服务器数据失败，返回：' + JSON.stringify(updateReturn));
                        }
        
                        let $img = $(window.frames[0].document).find("#randSaveImg");
                        $img.click();
                        setTimeout(function () {
                            submitSingleData(postdataArr, ++post_index);
                        }, 500);
                    });
                }
            }
        
            /**
             * 直接提交数据
             */
            function submitUploadDataNow(postdataObj_data, cb) {
        
                let $img = $(window.frames[0].document).find("#randSaveImg");
                let validateCode = resolveCode($img)
                if (validateCode && validateCode.length === 4) {
                    let validateValcodeData = {
                        data: postdataObj_data.dirtydata,
                        verifycode: validateCode,
                        ttype: "1",
                        loginuserid: storageutils.get("cp_guserid"),
                    };
                    // 1、校验验证码
                    let cp_validateReturn = cp_post("http://aqgl.crcc.cn/safequality/troubledvr.do?reqCode=validateEditGridAttacheType", validateValcodeData);
                    if (cp_validateReturn && cp_validateReturn.success) {
                        // # 提交结果
                        let submitTableData = {
                            hasCheckPerson: true,
                            userids: "aa",
                            opt: "add",
                            batchid: "",
                            fid: getfid(),
                            dirtydata: postdataObj_data.dirtydata,
                            unitProject: postdataObj_data.unitProject,
                            ttype: 1,
                            unitProjectName: postdataObj_data.unitProjectName,
                            workTeam: postdataObj_data.workTeam,
                            wtCheckMan: postdataObj_data.wtCheckMan,
                            safetyphone: postdataObj_data.safetyphone,
                            verifycode: validateCode,
                            loginuserid: storageutils.get("cp_guserid"),
                        };
        
                        // 2、开始提交
                        let cp_submitReturn = cp_post("http://aqgl.crcc.cn/safequality/troubledvr.do?reqCode=troubleSubmitExamine", submitTableData);
                        // 保存成功
                        if (cp_submitReturn && cp_submitReturn.success) {
                            tips(true, '[ I ]提交数据成功');
                            cb();
                        } else {
                            $img.click();
                            setTimeout(function () {
                                submitUploadDataNow(postdataObj_data, cb);
                            }, 500);
                        }
                    } else {
                        $img.click();
                        setTimeout(function () {
                            submitUploadDataNow(postdataObj_data, cb);
                        }, 500);
                    }
                } else {
                    $img.click();
                    setTimeout(function () {
                        submitUploadDataNow(postdataObj_data, cb);
                    }, 500);
                }
            }
        
            /**
             * 生成今日要提交的数据
             */
            function generateTodayData(oneKey) {
                
                let initFlag = initTodayData();
                if (initFlag === false) {
                    return false;
                }
        
                let genGroupNumAlreay = 0;// 已生成今日的组数
        
                // 弹窗提示已经生成的数据
                let generateFlag = true;// 是否要生成数据
                
                debugger;
                
                if(!(oneKey && genGroupNumber > 0)){
                    generateFlag = confirm('您今天已经生成了 ' + genGroupNumber + ' 组数据，是否重新生成？');
                } else {
                    // 一键生成，并且已经生成过了，不再生成
                    generateFlag = false;
                }
                if (generateFlag === false) {
                    tips(true, "[ I ]生成数据的操作 已经取消");
                    return true;
                }
        
                tips(true, "[ I ]正在为您生成数据，请稍后...");
        
                let dirtyDataTempArr = [];
        
                for (let i = 0; i < unitArr.length; i++) {
        
                    let unitItem = unitArr[i];
                    let unitText = unitItem.text;// 项目名称
                    let unitCheckman = unitItem.checkman;// 检查人
                    let unitWorkteam = unitItem.workteam;// 劳务公司
                    let unitPhone = unitItem.safetyphone;// 手机
                    let unitValue = unitItem.value;// unitvalue
        
                    // 开始校验单位
                    let checkdata = {
                        fid: getfid(),
                        unitProjectid: unitValue,
                        ttype: "1",
                        loginuserid:storageutils.get("cp_guserid"),
                    };
                    let checkunitData = cp_post('http://aqgl.crcc.cn/safequality/troubledvr.do?reqCode=verificationUnitProejct', checkdata);
        
                    if (!checkunitData || !checkunitData.result === true) {
                        tips(false, 'check unit：' + '校验单位是否可以生成数据' + unitItem.text);
                        continue;
                    }
        
                    tips(false, '---1 ' + '正在准备单位数据：' + unitItem.text);
        
                    // 共同的参数，最后加入
                    let commonData = {
                        opt: 'add',
                        batchid: '',
                        fid: getfid(),
                        unitProject: unitValue,
                        unitProjectName: unitText,
                        workTeam: unitWorkteam,
                        wtCheckMan: unitCheckman,
                        safetyphone: unitPhone,
                        ttype: 1,
                        loginuserid: storageutils.get("cp_guserid"),
                    };
        
                    let lastNodesData = cp_post("${cfg.crccBaseUrl}/crcc/getLastNodes");
                    if ((lastNodesData.code || 0) === 1) {
                        let lastNodes = lastNodesData.data;
                        for (let k = 0; k < lastNodes.length; k++) {
        
                            // 隐患node节点
                            let lastNode = lastNodes[k];
        
                            tips(false, '---2 ' + '正在准备隐患节点数据：' + lastNode.danger_name);
        
                            let problemsData = cp_post("${cfg.crccBaseUrl}/crcc/getProblemByNodeid", {nodeid: lastNode.id});
                            if ((problemsData.code || 0) === 1) {
                                let problems = problemsData.data;
        
                                for (let l = 0; l < problems.length; l++) {
                                    // 隐患node 对应的问题
                                    let problem = problems[l];
        
                                    tips(false, '---3 ' + '正在准备隐患问题数据：' + problem.problem);
        
                                    let dirtyItem = {
                                        unitproject: unitText,
                                        workteam: unitWorkteam,
                                        wtcheckman: unitCheckman,
                                        troublescore: lastNode.score,
                                        dangerid: lastNode.id,
                                        troublescore: lastNode.score,
                                        titledesc: lastNode.danger_name,
                                        discoverydate: dateutils.format(new Date(), 'yyyy-MM-dd'),
                                        attache_type: 0,
                                        rleaf: "0",
                                        handleman: unitCheckman,
                                        danger_longname: lastNode.danger_longname,
                                        danger_longname: lastNode.danger_longname,
                                        flgid: dirtyDataTempArr.length + 1,
                                        type: 1,
                                        danger_level: "2",
                                        troublename: problem.problem,
                                        remark: problem.problem,
                                        peoplecount: 2,
                                        probability: getRandom(1, 2),
                                        belongsort: "3",
                                        place: "2",
                                        fntech: "1",
                                        inoutroad: "2",
                                        hasworker: "1",
                                        solutions: "1",
                                        hasresolvent: '${probCfg.solution[getRandom(0, 1)]}',
                                        handledate: dateutils.format(new Date(), 'yyyy-MM-dd') + "T00:00:00",
                                    };
                                    dirtyDataTempArr.push(dirtyItem);
        
                                    // 超过生成总数，直接退出
                                    let cp_genGroupNum = ${cfg.cp_genGroupNum};
                                    if (cp_genGroupNum !== -1 && (cp_genGroupNum === 0 || genGroupNumAlreay >= cp_genGroupNum)) {
                                        tips(true, '[ I ]生成数据完毕, 共生成' + genGroupNumAlreay + '组数据');
                                        return true;
                                    }
                                    else {
                                        if (dirtyDataTempArr.length >= ${cfg.cp_pagesize}) {
                                            let codekey = {
                                                unitcode: commonData.unitProject,
                                                nodecode: lastNode.id,
                                                problemcode: problem.index,
                                            };
                                    
                                            // 每提交一次数据，每次新增一组，并将临时数据置空
                                            uploadPostDataOnce(codekey, commonData, dirtyDataTempArr);
                                            genGroupNumAlreay++;
                                            dirtyDataTempArr = [];
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                tips(true, '[ I ]生成数据完毕, 共生成' + genGroupNumAlreay + '组数据');
                return true;
            }
        
            /**
             * 分批次上传
             * @param unitcode 单位编码
             * @param nodecode 隐患node编码
             * @param problemcode 问题编码
             * @param commonData
             * @param dirtyDataTempArr
             */
            function uploadPostDataOnce({unitcode, nodecode, problemcode}, commonData, dirtyDataTempArr) {
        
                commonData.dirtydata = JSON.stringify(dirtyDataTempArr);
                let requestData = {
                    unitcode: unitcode,
                    nodecode: nodecode,
                    problemcode: problemcode,
                    postData: JSON.stringify(commonData),
                };
                let result = cp_post('${cfg.crccBaseUrl}/crcc/uploadPostData', requestData);
                tips(false, '上传要提交的数据结果，' + JSON.stringify(result));
            }
            
            /**
            * 获取fid
            * @returns {*}
            */
            function getfid(){
                return window.frames[0]._fid;
            }
        </script>
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