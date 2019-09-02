#include json2.js
#include style.js

/*!
 * 电商页面快速录入-PhotpShop脚本
 * PageEntry-PhotoshopScript
 *
 * Copyright(C)TonyChou  yplus.me
 * tonydeb@qq.com
 *
 * Date: 2019年8月31日 14点25分
 */
(function main() {
    //设置json输入窗口
    var dlg = new Window("dialog{text:'输入分隔符制表文本',bounds:[100,100,561,269],\
iwtfkhamhc:EditText{bounds:[16,16,444.95,94] , text:'' ,properties:{multiline:true,noecho:false,readonly:false}},\
limitFieldd:EditText{bounds:[130,100,444.95,120] , text:'请先选择下拉框' ,properties:{multiline:false,noecho:false,readonly:false}},\
applyButton:Button{bounds:[16,140,117,160] , text:'确认' },\
cancelButton:Button{bounds:[236,140,336,160] , text:'取消' },\
dropdown0:DropDownList{bounds:[16,100,120,120],properties:{items:['---请选择----','PC','自定义']}},\
};");

    dlg.cancelButton.onClick = function() {
        return dlg.close();
    };
    platform = "pc";
    dlg.dropdown0.selection = 0;
    dlg.limitFieldd.enabled = false;
    dlg.iwtfkhamhc.enabled = false;
    dlg.dropdown0.onChange = function() {
        dlg.limitFieldd.enabled = false;
        dlg.iwtfkhamhc.enabled = true;
        if (dlg.dropdown0.selection.text == "PC") {
            dlg.limitFieldd.text = "model,play,price,time,btn";
            platform = "pc";
        } else if (dlg.dropdown0.selection.text == "自定义") {
             platform = "zd";
            dlg.limitFieldd.enabled = true;
            dlg.limitFieldd.text = "model,play,price,time,btn";
        }
    }

    dlg.applyButton.onClick = function() {
  try {

            var doc = app.activeDocument;
            var jsonText = tsvJSON(dlg.iwtfkhamhc.text);
            var jsonObj = JSON.parse(jsonText);
            //导入限制的字
            limitFieldText = dlg.limitFieldd.text.split(',');
            completGroup = "";
            for (var i = 0; i < jsonObj.length; i++) {
                var json = jsonObj[i];
                  //处理包含“model_top”图层组
                processGroup(doc, json.model + '_top', json, );
                //处理包含“model_txt”图层组
                processGroup(doc, json.model + '_text', json, );
            }
            alert('录入已完成:\r ' + completGroup);
            return dlg.close();
        } catch(err) {
            alert('出现错误(' + err + ')\r已录入：' + completGroup);
            return dlg.close();
        }
    };

    dlg.show();

})();

//递归查找并处理。参数分别是文件，要查找的图层名字，要替换的内容（JSON），限制改变的图层
function processGroup(doc, layerName, JsonGroup) {
    //分析当前layers.length，这个layers可以是Layer也可以是LayerSet，逻辑上是当做LayerSet处理
    for (var i = 0; i < doc.layerSets.length; i++) {
        //取LayerSet的每一个Layer/LayerSet
        var layerRef = doc.layers[i];
        //  alert(layerName+"----当前在"+layerRef+"i等于:"+max);
        if (layerRef.typename === "LayerSet") {
            //  alert("当前名字"+layerRef.name);
            //找到就修改
            if (layerRef.name === layerName) {
               //   alert("找到了"+layerRef.name);
                //输出报告区分是否店招
                if (layerName == JsonGroup['model'] + "_top") completGroup += "\r" + JsonGroup['model'] + "(top)\t";
                else completGroup += "\r" + JsonGroup['model'] + "\t";
                for (var i = 0; i < limitFieldText.length; i++) {
                    //根据约定判断字符变化方式 按实际方式确认
                    if (platform == "pc" && layerName == JsonGroup['model'] + "_text") {
                        //文本按约定style处理
                        if (limitFieldText[i] == "play" && parseInt(JsonGroup['style']) != 0 ) {
                            // 更改文本
                            layerRef.layers[limitFieldText[i]].textItem.contents = dealTextStyle(JsonGroup[limitFieldText[i]], parseInt(JsonGroup['style']));
                            //按style.js样式更改文本
                            if (parseInt(JsonGroup['style']) === 2) {
                                doc.activeLayer = layerRef.layers[limitFieldText[i]];
                                changeTextStyle1(dealTextStyle(JsonGroup[limitFieldText[i]], parseInt(JsonGroup['style'])));
                            }
                        } else {
                            layerRef.layers[limitFieldText[i]].textItem.contents = JsonGroup[limitFieldText[i]];
                        }
                    
                    } else {
                        //自定义字段进行普通处理
                        layerRef.layers[limitFieldText[i]].textItem.contents = JsonGroup[limitFieldText[i]];
                    }
                    completGropDeal(limitFieldText[i]);
                
                }
                 break;
            } else {
                //没找到就继续递归查找
                processGroup(layerRef, layerName, JsonGroup);
            }
        }
    }


}

//文字处理
function dealTextStyle(TextContent, dealNum) {
    //去除多余空格
   var  TextContentS = TextContent.replace(/\s+/g, ' ');
    //开始处理  约定：
    /*
0.默认不变化
1.变两行
2.变两行，并按代码变化样式
3.截取后半段
    */
    var newText = "";
    switch (dealNum) {
    case -1 : 
   if( TextContentS.indexOf(" ") != -1){
        var newText = TextContentS.split(" ");
        return newText[1];
        }else return TextContentS;
        break;  
    case 0:
        break;
    case 1:
        var newText = TextContentS.replace(" ", "\r");
        // layerText=newText;
        return newText;
        break;
    case 2:
        var newText = TextContentS.replace(" ", "\r");
        //   layerText=newText;
        return newText;
        //   changeTextStyle1(newText);
        //return newText;
        break;
default:
break;
}
    }     
//输出监控
function completGropDeal(str) {
    completGroup += str + "(√)\t"
}


//TSV转化json
function tsvJSON(tsv) {
    var lines = tsv.split("\n");
    var result = [];
    var headers = lines[0].split("\t");
    for (var i = 1; i < lines.length; i++) {
        var obj = {};
        var currentline = lines[i].split("\t");
        for (var j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentline[j];
        }
        result.push(obj);
    }
    //return result; //JavaScript object
    return JSON.stringify(result); //JSON
}