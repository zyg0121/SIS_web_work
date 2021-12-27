let pageNo = 1; // 初始化全局变量pageNo（当前所在页数）

// 获取学生信息函数,opt参数传递获取的内容：上一页(pre)，下一页(next)或空（直接获取第一页）
function getStudentInfo(opt) {
    let name = $('#InputName').val(); // 获取姓名
    let stuno = $('#InputNo').val(); // 获取学号
    let perpage = $('#per_page').val(); // 获取每页需要展示的数据数
    let page = pageNo; // 获取当前所在页数
    if (opt === 'pre') page = page - 1; // 如果请求获取上一页，则请求页数为当前页数-1
    else if (opt === 'next') page = page + 1; // 如果请求获取下一页，则请求页数为当前页数+1
    else page = 1; // 否则默认获取第一页
    // 通过AJax get请求方法从后端获取学生信息和有关分页内容的信息
    // 请求地址为/showinfo 传递参数为姓名，学号，每页需要展示的数据数，和需要请求的页码 请求结果存在result
    $.get("/showinfo", {name: name, stuno: stuno, per_page: perpage, page: page}, function (result) {
        //console.log(result)
        // 测试输出
        console.log(result['stuinfo'])
        console.log(result['paginate'])
        // eval存在安全性问题，此处停止使用，改用parseJson
        /*var ret_stu = eval(result['stuinfo'])
        var ret_paginate = eval(result['paginate'])*/
        let ret_stu = $.parseJSON(result['stuinfo'].toString()); //将json字符串转换为json类型数据
        let ret_paginate = result['paginate'];
        $('#stuInfo').html(''); // 初始输出学生信息内容块清空
        $('#checkAll').prop('checked',false); // 全选框默认为不选择
        $.each(ret_stu, function (info, value) { // 对获取到的学生信息的json数组类型数据进行遍历
            console.log(value.stu_id); // 测试输出学生学号
            console.log(typeof value.stu_id);
            $('#stuInfo').append(  // 动态加载学生信息内容 append为向内容块追加内容
                "<tr id=\'tr"+ value.stu_id + "\'  '>" +
                "<td><input type=\"checkbox\" name=\"checkItem\" id=\"" + value.stu_id + "\" onclick=checkInputClick(this) /></td>" +
                "<td>" + value.stu_id + "</td>" +
                "<td>" + value.stu_name + "</td>" +
                "<td>" + value.stu_sex + "</td>" +
                "<td>" + value.stu_age + "</td>" +
                "<td>" + value.stu_origin + "</td>" +
                "<td>" + value.stu_profession + "</td>" +
                "</tr>"
            )
        });
        $('#navPaginate').html(''); // 初始化导航栏部分
        if (ret_paginate['has_prev'] === 'yes') { // 判断是否为第一页,不是则追加上一页的按钮
            //$('#navPaginate').append('<li><a href=\"/showinfo?page=' + ret_paginate['prev_num'] + '\">上一页</a></li>');
            $('#navPaginate').append('<li><button class="btn btn-default" type="button" id="prePage" onclick=getStudentInfo(\'pre\') >上一页</button></li>');
        }
        $('#navPaginate').append('<li><a href="#">第' + ret_paginate['page'] + '页，共' + ret_paginate['pages'] + '页</a></li>');
        if(ret_paginate['page'] < ret_paginate['pages']) { // 判断是否为最后一页，不是则追加下一页的按钮
            $('#navPaginate').append('<li><button class="btn btn-default" type="button" id="nextPgae" onclick=getStudentInfo(\'next\')>下一页</button></li>');
        }
        $('#navPaginate').append( // 追加每页显示的数据条数和查询总共的数据条数
            '<br/>每页显示' +
            '<select id="per_page" name="per_page" onchange=per_page_check()>\n' +
            '     <option>5</option>\n' +
            '     <option>10</option>\n' +
            '      <option>20</option>\n' +
            '</select>条数据，' +
            '共有' + ret_paginate['total'] + '条数据'
        );
        $('#per_page').val(ret_paginate['per_page']) // 修改每页显示的数据条数信息
        pageNo = ret_paginate['page']; // 修改当前所在页码信息
    });
}

getStudentInfo();

// 监控select每页展示数据条数信息的函数调用
function per_page_check() {
    getStudentInfo();
}

// 对全选checkbox进行监听事件
function checkAllClick() {
    /*将所有行的选中状态设成全选框的选中状态*/
    var $tbr = $('#info tbody tr');
    $tbr.find('input').prop('checked', $(this).prop('checked'));
    /*并调整所有选中行的CSS样式*/
    if ($('#checkAll').prop('checked')) {
        $tbr.find('input').parent().parent().addClass('warning');
        $tbr.find('input').prop('checked', true);
        console.log('warning');
    } else {
        $tbr.find('input').parent().parent().removeClass('warning');
        $tbr.find('input').prop('checked', false);
        console.log('warning');
    }
}

// 点击单行数据的checkbox的监听事件，elementId的实参为当前checkbox的id
function checkInputClick(elementId) {
    var $tbr = $('#info tbody tr');
    /*调整选中行的CSS样式*/
    console.log(elementId.id);
    var id = elementId.id; // 获取当前操作checkbox的id
    if ($('#' + id).prop('checked')) { // 点了
        $('#' + id).parent().parent().addClass('warning');
        console.log('input warning a');
    } else { // 不点了
        $('#' + id).parent().parent().removeClass('warning');
        console.log('input warning b');
    }
    /*如果已经被选中行的行数等于表格的数据行数，将全选框设为选中状态，否则设为未选中状态*/
    $('#checkAll').prop('checked', $tbr.find('input:checked').length === $tbr.length);

}

// 多选学生信息,将全选/反选复选框添加到表头最前，即增加一列
function initTableCheckbox() {
    var $thr = $('#info thead tr');
    var $checkAllTh = $('<th><input type="checkbox" id="checkAll" name="checkAll" onclick=checkAllClick() /></th>');
    /*将全选/反选复选框添加到表头最前，即增加一列*/
    $thr.prepend($checkAllTh);
}

initTableCheckbox();


// 增加学生信息按钮触发事件，加载增加学生信息窗口界面并获取专业信息
$("#btn_add").click(function () {
    $("#addModalLabel").text("新增学生信息"); // 修改弹出窗口标题
    $('#addModal').modal(); // 弹出增加学生信息窗口
    if ($("#add_stu_profession").val() == null) { // 如果没有加载过专业相关信息
        $.get("/add", function (result) { // 通过Ajax的get方法 请求add路由获取专业信息，返回值为result
            console.log(result)
            for (var i in result) { // 对result进行遍历，将获取到的专业信息增加到专业的select中
                $("#add_stu_profession").append("<option value='" + i + "'>" + result[i] + "</option>")
            }
        });
    }
});

// 以下check部分均为正则表达式检验部分,具体流程可以参考idCheck
function nameCheck(opt) {
    let reg = /^[\u4e00-\u9fa5]{2,6}$/; //2-6中文
    if (opt === "add") {
        let name = $("#addStudentInfo .name").val();
        if (!reg.test(name) || name === '') {
            //console.log('error')
            $('#addStudentInfo .nameForm').attr("class", "form-group nameForm has-error");
            $('#addStudentInfo .nameHelpBlock').text('请输入正确的姓名(2-6位中文)！');
            return false;
        } else {
            //console.log('√');
            $('#addStudentInfo .nameForm').attr("class", "form-group nameForm has-success");
            $('#addStudentInfo .nameHelpBlock').text('');
            return true;
        }
    } else if (opt === "update") {
        let name = $("#updateStudentInfo .name").val();
        if (!reg.test(name) || name === '') {
            //console.log('error')
            $('#updateStudentInfo .nameForm').attr("class", "form-group nameForm has-error");
            $('#updateStudentInfo .nameHelpBlock').text('请输入正确的姓名(2-6位中文)！');
            return false;
        } else {
            //console.log('√');
            $('#updateStudentInfo .nameForm').attr("class", "form-group nameForm has-success");
            $('#updateStudentInfo .nameHelpBlock').text('');
            return true;
        }
    } else if (opt === "search") {
        let name = $("#InputName").val();
        if (!reg.test(name) || name === '') {
            //console.log('error')
            $('#nameSearchForm').attr("class", "form-group has-error");
            return false;
        } else {
            //console.log('√');
            $('#nameSearchForm').attr("class", "form-group has-success");
            return true;
        }
    } else {
        console.log("error!");
    }
}

function idCheck(opt) {
    let reg = /^\d{9,12}$/; //验证学号的正则表达式，此处意思是学号必须为长度9-12的数字
    if (opt === "add") { //增加学生信息
        let id = $("#addStudentInfo .id").val();//得到输入的值
        if (!reg.test(id) || id === '') { //不符合正则表达式或没输入任何值
            //console.log('error')
            $('#addStudentInfo .idForm').attr("class", "form-group idForm has-error");//修改输入框的样式为红色
            $('#addStudentInfo .idHelpBlock').text('请输入正确的学号(9-12位数字)！');   //显示错误提示
            return false;
        } else {
            //console.log('√');
            $('#addStudentInfo .idForm').attr("class", "form-group idForm has-success");//修改输入框的样式为绿色
            $('#addStudentInfo .idHelpBlock').text(''); //不显示提示信息
            return true;
        }
    } else if (opt === "update") { //更新学生信息
        let id = $("#updateStudentInfo .id").val();
        if (!reg.test(id) || id === '') {
            $('#updateStudentInfo .idForm').attr("class", "form-group idForm has-error");
            $('#updateStudentInfo .idHelpBlock').text('请输入正确的学号(9-12位数字)！');
            return false;
        } else {
            //console.log('√');
            $('#updateStudentInfo .idForm').attr("class", "form-group idForm has-success");
            $('#updateStudentInfo .idHelpBlock').text('');
            return true;
        }
    } else if (opt === "search") { //搜索功能
        let id = $("#InputNo").val();
        if (!reg.test(id) || id === '') {
            //console.log('error')
            $('#idSearchForm').attr("class", "form-group has-error");
            return false;
        } else {
            //console.log('√');
            $('#idSearchForm').attr("class", "form-group has-success");
            return true;
        }
    } else {
        console.log("error");
    }
}

function ageCheck(opt) {
    let reg = /^\d{1,3}$/;
    if (opt === "add") {
        let age = $("#addStudentInfo .age").val();
        if (!reg.test(age) || age === '') {
            //console.log('error')
            $('#addStudentInfo .ageForm').attr("class", "form-group ageForm has-error");
            $('#addStudentInfo .ageHelpBlock').text('请输入正确的年龄！');
            return false;
        } else {
            //console.log('√');
            $('#addStudentInfo .ageForm').attr("class", "form-group ageForm has-success");
            $('#addStudentInfo .ageHelpBlock').text('');
            return true;
        }
    } else if (opt === "update") {
        let age = $("#updateStudentInfo .age").val();
        if (!reg.test(age) || age === '') {
            //console.log('error')
            $('#updateStudentInfo .ageForm').attr("class", "form-group ageForm has-error");
            $('#updateStudentInfo .ageHelpBlock').text('请输入正确的年龄！');
            return false;
        } else {
            //console.log('√');
            $('#updateStudentInfo .ageForm').attr("class", "form-group ageForm has-success");
            $('#updateStudentInfo .ageHelpBlock').text('');
            return true;
        }
    } else {
        console.log("error!");
    }

}

function originCheck(opt) {
    let reg = /^[\u4e00-\u9fa5]{2,10}$/;
    if (opt === "add") {
        let origin = $("#addStudentInfo .origin").val();
        if (!reg.test(origin) || origin === '') {
            //console.log('error')
            $('#addStudentInfo .originForm').attr("class", "form-group originForm has-error");
            $('#addStudentInfo .originHelpBlock').text('请输入正确的籍贯！');
            return false;
        } else {
            //console.log('√');
            $('#addStudentInfo .originForm').attr("class", "form-group originForm has-success");
            $('#addStudentInfo .originHelpBlock').text('');
            return true;
        }
    } else if (opt === "update") {
        let origin = $("#updateStudentInfo .origin").val();
        if (!reg.test(origin) || origin === '') {
            //console.log('error')
            $('#updateStudentInfo .originForm').attr("class", "form-group originForm has-error");
            $('#updateStudentInfo .originHelpBlock').text('请输入正确的籍贯！');
            return false;
        } else {
            //console.log('√');
            $('#updateStudentInfo .originForm').attr("class", "form-group originForm has-success");
            $('#updateStudentInfo .originHelpBlock').text('');
            return true;
        }
    }

}

// 将表单内的内容转换为json格式
$.fn.serializeJson = function () {
    var o = {};
    var a = this.serializeArray(); // 转换为array
    $.each(a, function () { // 遍历
        if (o[this.name]) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

// 执行增加学生信息操作
function addSub() {
    if (nameCheck("add") && idCheck("add") && ageCheck("add") && originCheck("add")) {//前端验证完毕
        console.log('all right');
        let ret = $('#addStudentInfo').serializeJson(); // 表单数据变为json
        console.log(ret);
        $.ajax({ //执行ajax请求，将前端验证后的数据传递给后端
            type: 'POST',//请求为post
            url: '/add', //服务器端路由为/add
            data: ret,  //得到封装后的Json数据
            dataType: 'Json',
            success: function (ret, message) {
                if (ret['code'] === 200) toastr.success('提交数据成功!');//提交成功，通过toastr显示提示
                else toastr.error('提交数据失败!');//提交出错，通过toastr显示提示
                console.log(ret);
                console.log(message);
                getStudentInfo();
            },
            error: function (ret, message) {
                toastr.error('提交数据失败!');//提交失败，通过toastr显示提示
                console.log(message);
            }
        });

    } else {
        console.log("error!!!");
        toastr.error('提交的数据不符合数据规则！！！');
    }
}

// 修改学生信息按钮触发事件，加载修改学生信息窗口界面并获取专业信息
$("#btn_update").click(function () {

    // 判断选择的学生的数目 若不为1，则弹出消息警告
    var $tbr = $('table tbody tr');
    if ($tbr.find('input:checked').length === 1) {
        //console.log('点了');
        $("#updateModalLabel").text("修改学生信息"); // 修改弹出窗口标题
        $('#updateModal').modal(); // 弹出修改学生信息窗口
        if ($("#update_stu_profession").val() == null) { // 如果没有获取过学生的专业信息
            $.get("/add", function (result) { //通过Ajax的get方法，借用add路由获取专业信息，不规范但挺好用
                console.log(result)
                for (let i in result) { // 遍历专业信息并添加到专业信息的select中
                    $("#update_stu_profession").append("<option value='" + i + "'>" + result[i] + "</option>")
                }
            });
        }

        // 根据获得的学生学号get原有信息
        var stuid = $tbr.find('input:checked')[0]['id'];

        $.get("/update", {id: stuid}, function (ret) { // 通过Ajax的get方法，请求update路由，获取该学生的原有信息
            // 根据所获得的学生信息对表单内容进行修改
            console.log(ret);
            $("#update_stu_id").val(ret['stu_id']);
            $("#update_stu_name").val(ret['stu_name']);
            if (ret['stu_sex'] === '女') { // 若为女，则勾选女生，取消勾选男生
                $('#update_stu_sex_male').prop('checked', false);
                $('#update_stu_sex_female').prop('checked', true);
            } else { // 否则勾选男生，取消勾选女生
                $('#update_stu_sex_male').prop('checked', true);
                $('#update_stu_sex_female').prop('checked', false);
            }
            $("#update_stu_age").val(ret['stu_age']);
            $("#update_stu_origin").val(ret['stu_origin']);
            $("#update_stu_profession").val(ret['stu_profession_id']);
        });

    } else if ($tbr.find('input:checked').length === 0) { // 没有勾选学生信息
        toastr.error('请选择一个学生的信息进行修改！');
    } else { //勾选多个学生信息
        toastr.error('只能选择一个学生的信息进行修改！');
    }

});

// 执行修改学生信息操作,方法实现同addSub()类似
function updateSub() {
    if (nameCheck("update") && idCheck("update") && ageCheck("update") && originCheck("update")) {
        console.log('all right');
        let ret = $('#updateStudentInfo').serializeJson(); // 表单数据变为json
        console.log(ret);
        $.ajax({
            type: 'POST',
            url: '/update',
            data: ret,
            dataType: 'Json',
            success: function (ret, message) {
                if (ret['code'] === 200) {
                    toastr.success('修改数据成功!');
                    getStudentInfo();
                } else toastr.error('修改数据失败!');
                console.log(ret);
                console.log(message);
            },
            error: function (ret, message) {
                toastr.error('修改数据失败!');
                console.log(message);
            }
        });

    } else {
        console.log("error!!!");
        toastr.error('修改的数据不符合数据规则！！！');
    }
}

// 删除学生信息按钮触发事件，加载删除学生信息窗口界面并获取待删除学生学号
$("#btn_del").click(function () {
    let $tbr = $('table tbody tr');
    if ($tbr.find('input:checked').length == 0) { // 如果没有勾选学生信息
        toastr.error('请选择需要删除的学生信息！');
    } else {
        $("#delModalLabel").text("删除学生信息"); // 修改删除学生信息窗口标题
        $('#delModal').modal(); // 弹出删除学生信息窗口
        let studelid = new Array(); // 建立空数组存储待删除的学号
        for (let i = 0; i < ($tbr.find('input:checked').length); i++) {
            studelid[i] = $tbr.find('input:checked')[i]['id']; // 将获取的学号信息存入数组中
        }
        let studelidstr = studelid.toString(); // 将获取的学号数组字符串化输出
        $('#delInfoId').html(studelidstr); // 将获取的学号数组字符串化写入html展示中
    }

});

// 执行删除学生信息操作
function delSub() {
    let $tbr = $('table tbody tr');
    let studelid = new Array(); // 建立空数组存储待删除的学号
    for (let i = 0; i < ($tbr.find('input:checked').length); i++) {
        studelid[i] = $tbr.find('input:checked')[i]['id']; // 将获取的学号信息存入数组中
    }
    for (let i = 0; i < ($tbr.find('input:checked').length); i++) {
        // 对获取到的每个学生学号信息依次进行删除,采用get请求，请求路由为/del/待修改的学生id
        $.get("/del/" + studelid[i].toString(), function (result) {
            console.log(result)
            if (result['code'] === 200) { // 根据返回成功情况输出修改结果
                toastr.success('删除学号为' + studelid[i].toString() + "的数据成功!");
            } else toastr.error('删除学号为' + studelid[i].toString() + "的数据失败!");
        });
        if(i === ($tbr.find('input:checked').length)-1 ) { // 如果执行到最后一次删除操作后则刷新数据
            console.log('okk');
            getStudentInfo();
        }
    }
}

/*
获取被选中的学号
var $tbr = $('table tbody tr');
for(let i=0;i<($tbr.find('input:checked').length);i++) {
    console.log($tbr.find('input:checked')[i]['id']);
}
 */
