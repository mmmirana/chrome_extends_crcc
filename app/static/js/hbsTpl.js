/**
 * hbs模板
 *
 * @Author wangzf
 */
!function ($, Handlebars) {

    "use strict";

    var hbsTpl = {};

    // 传递表达式
    Handlebars.registerHelper('ex', function (str, options) {
        // 原字符串表达式
        var orginalStr = str;
        // 默认false
        var result = false;

        // 内部变量 @first @last @index @key
        var inReg = /\{\{@.*?\}\}/g;
        var inVariables = str.match(inReg);
        var inCtx = options.data;
        if (inVariables != null) {
            $.each(inVariables,
                function (i, v) {
                    var key = v.replace(/{{@|}}/g, "");
                    var value = typeof inCtx[key] === "string" ? ('"'
                        + inCtx[key] + '"') : inCtx[key];
                    str = str.replace(v, value);
                });
        }

        // 传入数据变量
        var reg = /\{\{.*?\}\}/g;
        var variables = str.match(reg);
        var context = this;

        if (variables != null) {
            $.each(variables, function (i, v) {
                var key = v.replace(/{{|}}/g, "").split('.');
                // 循环遍历属性
                var ctxvalue = context;
                $.each(key, function (index, item) {
                    if (ctxvalue == undefined) {
                        return true;
                    }
                    if (ctxvalue.hasOwnProperty(item)) {
                        ctxvalue = ctxvalue[item];
                    } else {
                        ctxvalue = ctxvalue.item;
                    }
                });

                var value = typeof ctxvalue === "string" ? ('"' + ctxvalue + '"')
                    : ctxvalue;

                str = str.replace(v, value);
            });
        }
        try {
            result = eval(str);

            // console.log("[ " + orginalStr + " ] parse--> [ " + str + " ] " + new Date().getTime());

            if (result) {
                return options.fn(this);
            } else {
                return options.inverse(this);
            }
        } catch (e) {
            console.error(str, '--Handlerbars Helper "ex" deal with wrong expression!');
            return options.inverse(this);
        }
    });

    /**
     * handlebar渲染模板
     *
     * @param $wrapper
     *            渲染完毕后要放入对应Dom元素对应的jquery对象
     * @param $tpl
     *            要渲染的模板
     * @param data
     *            数据源
     * @param isAppend
     *            是否追加数据，默认false
     *
     */
    hbsTpl.render = function ($wrapper, $tpl, data, isAppend) {
        var source = $tpl.text();
        var template = Handlebars.compile(source);
        var html = template(data);

        if (isAppend === true) {
            $wrapper.append(html);
        } else {
            $wrapper.html(html);
        }
    }

    window.hbsTpl = hbsTpl;

}($, Handlebars);