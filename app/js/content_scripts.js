console.log('content_scripts.js run');

let currentUrl = '';

// 登录页面
let loginUrlArr = ['http://aqgl.crcc.cn/login.do?reqCode=init',
    'http://aqgl.crcc.cn/login.do?reqCode=logout'];
let cfg = {
    crccBaseUrl: "http://127.0.0.1:3100",
    cp_fid: "30623",
    cp_guserid: "10426838",
    cp_pagesize: 20,// 每组默认20条记录
    cp_totalpage: 25,// 每次25组
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

    $plugin_js = $(`
        <script src="${cfg.crccBaseUrl}/web/static/js/dateutils.js"></script>
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
                    console.error("cp_get error:", JSON.stringify(jqXHR));
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
                    console.error("cp_post error:", JSON.stringify(jqXHR));
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
                console.error("解析验证码异常：", JSON.stringify(codeData));
                return "";
            }
        }
        
        function getBase64Image($img) {
            if ($img.length === 0) {
                console.error('抱歉，找不到对应的验证码');
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
        </script>
        `);

    if (loginUrlArr.indexOf(currentUrl) !== -1) {
        let $plugin_pop = $(`
        <div id="plugin_pop">
            <div>this is cp_pop</div>
            <div style="display: none">
                <div>
                    <input id="plugin_account" name="account" value="142202199002184972"/>
                </div>
                <div>
                    <input id="plugin_password" name="password" value="1234568Crcc"/>
                </div>
            </div>
            <button onclick="plugin_submit()">登录</button>
        </div>
        <script>
        
            function plugin_submit() {
                $("form#ext-gen10 input#account").val($("#plugin_account").val());
                $("form#ext-gen10 input#password").val($("#plugin_password").val());
                $("form#ext-gen10 #randCode").val(resolveCode($("#randImg")));
        
                $("button#ext-gen24").click();
            }
        
        </script>`);

        dosthDelay(function () {
            // 追加弹窗
            $("body").append($plugin_js);
            $("body").append($plugin_pop);
        })

        // $("form").submit();
    } else if (currentUrl === 'http://aqgl.crcc.cn/index.do?reqCode=indexInit') {
        window.open('http://aqgl.crcc.cn/safequality/troubledvr.do?reqCode=troubledvrWriteInit1&menuid4Log=01050501');
    } else if (currentUrl === 'http://aqgl.crcc.cn/safequality/troubledvr.do?reqCode=troubledvrWriteInit1&menuid4Log=01050501') {
        let $plugin_pop = $(`
                <div id="plugin_pop">
                <div>this is cp_pop</div>
                <div style="display: none;">
                    <input type="text" id="cp_pid" value="0" placeholder="上级节点id"/>
                    <button onclick="syncYinhuanNodes(0)">向服务器同步隐患节点数据</button>
                </div>
                <div>
                    <button onclick="syncYinhuanNodes(0)">同步隐患节点数据</button>
                    <button onclick="formatterData()">生成今日提交数据</button>
                    <br/>
                    <button onclick="submitData()">提交数据</button>
                </div>
            </div>
            <script>
            
                // 校验插件状态
                let plugin_status = 0;
            
                let unitArr = [];
            
                $().ready(function () {
                    // 获取单位名称
                    let unitArrData = cp_post('${cfg.crccBaseUrl}/crcc/getAllUnit',)
                    if (unitArrData && unitArrData.code === 1) {
                        unitArr = unitArrData.data;
                        plugin_status = 1;
                    } else {
                        plugin_status = 0;
                        console.error('插件服务器异常', JSON.stringify(unitArrData));
                    }
                });
            
                /**
                 * 将节点同步至本地服务器
                 */
                function syncYinhuanNodes(pid) {
                    if(!plugin_status){
                        alert("插件服务器异常");
                        return;
                    }
                    
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
                                    syncSuccess *= syncYinhuanNodes(childNode.id);
                                }
                            }
                        }
                    }
                    
                    console.log('同步隐患节点数据完成, syncSuccess:', syncSuccess);
                    
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
                    let uploadNumberData = cp_post('${cfg.crccBaseUrl}/crcc/getPostItemNumber', {"date": dateutils.format(new Date(), 'yyyy-MM-dd')});
                    if ((uploadNumberData.code || 0) === 1) {
                        let number = uploadNumberData.data;
                        let total = '${cfg.cp_totalpage}' * 1;
                        if (number >= total) {
                            console.log('submitData',"您今天已经上传了 " + number + "组数据");
                        } else {
                            let remain = total - number;
                            console.log('submitData','剩余上传', remain, '组');
                            let postdataData = cp_post('${cfg.crccBaseUrl}/crcc/getRandomPostData', {itemNumber: remain});
                            if ((postdataData.code || 0) === 1) {
                                let postdataArr = postdataData.data;
                                let post_index = 0;
                                
                                submitSingleData(postdataArr, post_index);
                                   
                                    // // 1 保存后再提交
                                    // submitSaveData(postdataObj_data, function (batchid) {
                                    //     // 提交服务器数据保存成功
                                    //     let updateSaveReturn = cp_post('${cfg.crccBaseUrl}/crcc/postdataSuccess',{postdata_id:postdataObj_id,postdata_status:1});
                                    //     console.log('submitSaveData','更新服务器数据状态，返回：', JSON.stringify(updateSaveReturn));
                                    //     // 保存完毕提交数据
                                    //     submitUploadData(postdataObj_data, batchid, function(){
                                    //         // 提交服务器数据提交成功
                                    //         let updateSubmitReturn = cp_post('${cfg.crccBaseUrl}/crcc/postdataSuccess',{postdata_id:postdataObj_id,postdata_status:3});
                                    //         console.log('submitUploadData','更新服务器数据状态，返回：', JSON.stringify(updateSubmitReturn));
                                    //     });
                                    // });
                                    
                                    // // 2 直接提交
                                    // submitUploadDataNow(postdataObj_data, function(){
                                    //     let updateReturn = cp_post('${cfg.crccBaseUrl}/crcc/postdataSuccess',{postdata_sid:postdataObj_sid,postdata_status:3});
                                    //     console.log('submitUploadData','更新服务器数据状态，返回：', JSON.stringify(updateReturn));
                                    // });
                            }
                        }
                    }
                }
                
                /**
                 * 遍历提交单条数据
                 */
                function submitSingleData(postdataArr, post_index) {
                
                    if (post_index < postdataArr.length) {
                        console.log('========== warning ==========', '正在提交数据 ' + (post_index + 1) + '/' + postdataArr.length);
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
                            console.log('submitUploadData', '更新服务器数据状态，返回：', JSON.stringify(updateReturn));
                
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
                function submitUploadDataNow(postdataObj_data, cb){
                    
                    if(!plugin_status){
                        alert("插件服务器异常");
                        return;
                    }
                    
                    let $img = $(window.frames[0].document).find("#randSaveImg");
                    let validateCode = resolveCode($img)
                    if (validateCode && validateCode.length === 4) {
                        let validateValcodeData = {
                            data: postdataObj_data.dirtydata,
                            verifycode: validateCode,
                            ttype: "1",
                            loginuserid:${cfg.cp_guserid},
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
                                fid: ${cfg.cp_fid},
                                dirtydata: postdataObj_data.dirtydata,
                                unitProject: postdataObj_data.unitProject,
                                ttype: 1,
                                unitProjectName: postdataObj_data.unitProjectName,
                                workTeam: postdataObj_data.workTeam,
                                wtCheckMan: postdataObj_data.wtCheckMan,
                                safetyphone: postdataObj_data.safetyphone,
                                verifycode: validateCode,
                                loginuserid: ${cfg.cp_guserid},
                            };
            
                            // 2、开始提交
                            let cp_submitReturn = cp_post("http://aqgl.crcc.cn/safequality/troubledvr.do?reqCode=troubleSubmitExamine", submitTableData);
                            // 保存成功
                            if (cp_submitReturn && cp_submitReturn.success) {
                                console.log('submitUploadData','提交数据成功', JSON.stringify(cp_submitReturn));
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
                 * 保存数据
                 */
                function submitSaveData(postdataObj_data, cb) {
            
                    let $img = $(window.frames[0].document).find("#randSaveImg");
                    let validateCode = resolveCode($img)
                    if (validateCode && validateCode.length === 4) {
                        let validateValcodeData = {
                            verifycode: validateCode,
                            ttype: "1",
                            loginuserid:${cfg.cp_guserid},
                            data: postdataObj_data.dirtydata,
                        };
                        // 1、校验验证码
                        let cp_validateReturn = cp_post("http://aqgl.crcc.cn/safequality/troubledvr.do?reqCode=validateEditGridAttacheType", validateValcodeData);
                        if (cp_validateReturn && cp_validateReturn.success) {
                            let saveTableData = Object.assign(postdataObj_data, {"verifycode": validateCode});
                            // 2、开始保存
                            let cp_saveReturn = cp_post("http://aqgl.crcc.cn/safequality/troubledvr.do?reqCode=insertTroubleDatas", saveTableData);
                            // 保存成功
                            if (cp_saveReturn.success) {
                                console.log('submitSaveData',"保存数据成功", JSON.stringify(cp_saveReturn));
                                // 重新获取验证码提交数据
                                let batchid = cp_saveReturn.pid;
                                cb(batchid);
                            } else {
                                $img.click();
                                setTimeout(function () {
                                    submitSaveData(postdataObj_data, cb);
                                }, 1000);
                            }
                        } else {
                            $img.click();
                            setTimeout(function () {
                                submitSaveData(postdataObj_data, cb);
                            }, 1000);
                        }
                    } else {
                        $img.click();
                        setTimeout(function () {
                            submitSaveData(postdataObj_data, cb);
                        }, 1000);
                    }
                }
            
            
                /**
                 * 提交数据
                 */
                function submitUploadData(postdataObj_data, batchid, cb) {
            
                    let $img = $(window.frames[0].document).find("#randSaveImg");
                    let validateCode = resolveCode($img);
            
                    if (validateCode && validateCode.length === 4) {
                        let validateValcodeData = {
                            verifycode: validateCode,
                            ttype: "1",
                            loginuserid:${cfg.cp_guserid},
                            data: []
                        };
                        // 1、校验验证码
                        let cp_validateReturn = cp_post("http://aqgl.crcc.cn/safequality/troubledvr.do?reqCode=validateEditGridAttacheType", validateValcodeData);
                        if (cp_validateReturn && cp_validateReturn.success) {
                            // # 提交结果
                            let submitTableData = {
                                hasCheckPerson: true,
                                userids: "aa",
                                opt: "edit",
                                batchid: batchid,
                                fid: 30623,
                                dirtydata: "[]",
                                unitProject: postdataObj_data.unitProject,
                                ttype: 1,
                                unitProject: postdataObj_data.unitProjectName,
                                workTeam: postdataObj_data.workTeam,
                                wtCheckMan: postdataObj_data.wtCheckMan,
                                safetyphone: postdataObj_data.safetyphone,
                                verifycode: resolveCode($img),
                                loginuserid: 10426838,
                            };
            
                            // 2、开始提交
                            let cp_submitReturn = cp_post("http://aqgl.crcc.cn/safequality/troubledvr.do?reqCode=troubleSubmitExamine", submitTableData);
                            // 保存成功
                            if (cp_submitReturn && cp_submitReturn.success) {
                                console.log('submitUploadData','提交数据成功', JSON.stringify(cp_submitReturn));
                                cb();
                            } else {
                                $img.click();
                                setTimeout(function () {
                                    submitUploadData(postdataObj_data, batchid, cb);
                                }, 1000);
                            }
                        } else {
                            $img.click();
                            setTimeout(function () {
                                submitUploadData(postdataObj_data, batchid, cb);
                            }, 1000);
                        }
                    } else {
                        $img.click();
                        setTimeout(function () {
                            submitUploadData(postdataObj_data, batchid, cb);
                        }, 1000);
                    }
                }
            
                /**
                 * 整理要提交的数据
                 */
                function formatterData() {
                    if(!plugin_status){
                        alert("插件服务器异常");
                        return;
                    }
                    
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
                            fid:${cfg.cp_fid},
                            unitProjectid: unitValue,
                            ttype: "1",
                            loginuserid:${cfg.cp_guserid},
                        };
                        let checkunitData = cp_post('http://aqgl.crcc.cn/safequality/troubledvr.do?reqCode=verificationUnitProejct', checkdata);
                        
                        if(!checkunitData || !checkunitData.result === true){
                            console.info('check unit', '校验单位是否可以生成数据' + unitItem.text);
                            continue;
                        }
                        
                        console.info('formatterData---1', '正在生成单位数据：' + unitItem.text);
            
                        // 共同的参数，最后加入
                        let commonData = {
                            opt: 'add',
                            batchid: '',
                            fid: ${cfg.cp_fid},
                            unitProject: unitValue,
                            unitProjectName: unitText,
                            workTeam: unitWorkteam,
                            wtCheckMan: unitCheckman,
                            safetyphone: unitPhone,
                            ttype: 1,
                            loginuserid: ${cfg.cp_guserid},
                        };
            
                        let lastNodesData = cp_post("${cfg.crccBaseUrl}/crcc/getLastNodes");
                        if ((lastNodesData.code || 0) === 1) {
                            let lastNodes = lastNodesData.data;
                            for (let k = 0; k < lastNodes.length; k++) {
                                
                                // 隐患node节点
                                let lastNode = lastNodes[k];
                                
                                console.info('formatterData---2', '正在生成隐患节点数据：' + lastNode.danger_name);
                                
                                let problemsData = cp_post("${cfg.crccBaseUrl}/crcc/getProblemByNodeid", {nodeid: lastNode.id});
                                if ((problemsData.code || 0) === 1) {
                                    let problems = problemsData.data;
            
                                    for (let l = 0; l < problems.length; l++) {
                                        // 隐患node 对应的问题
                                        let problem = problems[l];
                                        
                                        console.info('formatterData---3', '正在生成隐患问题数据：' + problem.problem);
                                        
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
            
                                        if (dirtyDataTempArr.length >= ${cfg.cp_pagesize}) {
                                            let codekey= {
                                                unitcode:commonData.unitProject,
                                                nodecode:lastNode.id,
                                                problemcode:problem.index,
                                            };
                                            uploadPostDataOnce(codekey,commonData, dirtyDataTempArr);
                                            dirtyDataTempArr = [];
                                        }
                                    }
                                }
                            }
                        }
                    }
                    console.log('formatterData', '正在生成数据完毕');
                }
            
                /**
                 * 分批次上传
                 * @param unitcode 单位编码
                 * @param nodecode 隐患node编码
                 * @param problemcode 问题编码
                 * @param commonData
                 * @param dirtyDataTempArr
                 */
                function uploadPostDataOnce({unitcode,nodecode,problemcode},commonData, dirtyDataTempArr) {
                    commonData.dirtydata = JSON.stringify(dirtyDataTempArr);
                    let requestData = {
                        unitcode:unitcode,
                        nodecode:nodecode,
                        problemcode:problemcode,
                        postData: JSON.stringify(commonData),
                    };
                    let result = cp_post('${cfg.crccBaseUrl}/crcc/uploadPostData', requestData);
                    console.log(JSON.stringify(result));
            
                    // console.log(validateCode);
                    // console.log(JSON.stringify(commonData));
                    // console.log(JSON.stringify(dirtyDataTempArr));
                }
            </script>
            `);

        // 点击新增
        dosthDelay(function () {
            // 追加弹窗
            $("body").append($plugin_js);
            $("body").append($plugin_pop);
            // 新增按钮
            $("#ext-gen36").click();

        }, 0.5)
        // window.open('http://aqgl.crcc.cn/safequality/troubledvr.do?reqCode=troubledvrWriteInit1&menuid4Log=01050501');
    }
})

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