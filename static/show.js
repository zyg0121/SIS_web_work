let pageNo = 1;

function Pagebtn(opt) {
    let name = $('#InputName').val();
    let stuno = $('#InputNo').val();
    let perpage = $('#per_page').val();
    let page = pageNo;
    if (opt === 'pre') page = page - 1;
    else if (opt === 'next') page = page + 1;
    else page = 1;
    $.get("/showinfo", {name: name, stuno: stuno, per_page: perpage, page: page}, function (result) {
        //console.log(result)
        console.log(result['stuinfo'])
        console.log(result['paginate'])
        var ret_stu = eval(result['stuinfo'])
        var ret_paginate = eval(result['paginate'])
        $('#stuInfo').html('');
        $.each(ret_stu, function (info, value) {
            console.log(value.stu_id);
            console.log(typeof value.stu_id);
            $('#stuInfo').append(
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
        $('#navPaginate').html('');
        if (ret_paginate['has_prev'] === 'yes') {
            //$('#navPaginate').append('<li><a href=\"/showinfo?page=' + ret_paginate['prev_num'] + '\">上一页</a></li>');
            $('#navPaginate').append('<li><button class="btn btn-default" type="button" id="prePage" onclick=Pagebtn(\'pre\') >上一页</button></li>');
        }
        $('#navPaginate').append(
            '<li><a href="#">第' + ret_paginate['page'] + '页，共' + ret_paginate['pages'] + '页</a></li>' +
            '<li><button class="btn btn-default" type="button" id="nextPgae" onclick=Pagebtn(\'next\')>下一页</button></li>' +
            '<br/>每页显示' +
            '<select id="per_page" name="per_page" onchange=per_page_check()>\n' +
            '     <option>5</option>\n' +
            '     <option>10</option>\n' +
            '      <option>20</option>\n' +
            '</select>条数据，' +
            '共有' + ret_paginate['total'] + '条数据'
        );
        $('#per_page').val(ret_paginate['per_page'])
        pageNo = ret_paginate['page'];
    });
}

Pagebtn();

function per_page_check() {
    Pagebtn();
}

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

function checkInputClick(elementId) {
    var $tbr = $('#info tbody tr');
    /*调整选中行的CSS样式*/
    console.log(elementId.id);
    var id = elementId.id;
    if ($('#' + id).prop('checked')) {
        $('#' + id).parent().parent().addClass('warning');
        console.log('input warning a');
    } else {
        $('#' + id).parent().parent().removeClass('warning');
        console.log('input warning b');
    }
    //console.log('#'+id);
    /*如果已经被选中行的行数等于表格的数据行数，将全选框设为选中状态，否则设为未选中状态*/
    $('#checkAll').prop('checked', $tbr.find('input:checked').length === $tbr.length);

}
/*
function checktrClick(element) {

    if($('#' + element.id).find('input').prop('checked') === false) {
        $('#' + element.id).find('input').attr('checked',true);
        $('#' + element.id).addClass('warning');
    } else {
        $('#' + element.id).find('input').attr('checked',false);
        $('#' + element.id).removeClass('warning');
    }

}*/

// 多选学生信息
function initTableCheckbox() {
    var $thr = $('#info thead tr');
    var $checkAllTh = $('<th><input type="checkbox" id="checkAll" name="checkAll" onclick=checkAllClick() /></th>');
    /*将全选/反选复选框添加到表头最前，即增加一列*/
    $thr.prepend($checkAllTh);
}

initTableCheckbox();


// add获取专业信息
$("#btn_add").click(function () {
    $("#addModalLabel").text("新增学生信息");
    $('#addModal').modal();
    if ($("#add_stu_profession").val() == null) {
        $.get("/add", function (result) {
            console.log(result)
            for (var i in result) {
                $("#add_stu_profession").append("<option value='" + i + "'>" + result[i] + "</option>")
            }
        });
    }
});

function nameCheck(opt) {
    let reg = /^[\u4e00-\u9fa5]{2,6}$/;
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

$.fn.serializeJson = function () {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function () {
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

function addSub() {
    if (nameCheck("add") && idCheck("add") && ageCheck("add") && originCheck("add")) {//前端验证完毕
        console.log('all right');
        let ret = $('#addStudentInfo').serializeJson(); // 表单数据变为json
        console.log(ret);
        $.ajax({ //执行ajax请求，将前端验证后的数据传递给后端
            type: 'POST',//请求为post
            url: '/add', //服务器端路由为/add
            data: ret,  //封装后的Json数据
            dataType: 'Json',
            success: function (ret, message) {
                if (ret['code'] === 200) toastr.success('提交数据成功!');//提交成功，通过toastr显示提示
                else toastr.error('提交数据失败!');//提交出错，通过toastr显示提示
                console.log(ret);
                console.log(message);
                Pagebtn();
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

// update获取专业信息
$("#btn_update").click(function () {

    // 判断选择的学生的数目
    var $tbr = $('table tbody tr');
    if ($tbr.find('input:checked').length === 1) {
        //console.log('点了');
        $("#updateModalLabel").text("修改学生信息");
        $('#updateModal').modal();
        if ($("#update_stu_profession").val() == null) {
            $.get("/add", function (result) { // 借用add获取专业信息，不规范但挺好用
                console.log(result)
                for (let i in result) {
                    $("#update_stu_profession").append("<option value='" + i + "'>" + result[i] + "</option>")
                }
            });
        }

        // 根据获得的学生学号get原有信息
        var stuid = $tbr.find('input:checked')[0]['id'];

        $.get("/update", {id: stuid}, function (ret) {
            console.log(ret);
            $("#update_stu_id").val(ret['stu_id']);
            $("#update_stu_name").val(ret['stu_name']);
            if (ret['stu_sex'] === '女') {
                $('#update_stu_sex_male').prop('checked', false);
                $('#update_stu_sex_female').prop('checked', true);
            } else {
                $('#update_stu_sex_male').prop('checked', true);
                $('#update_stu_sex_female').prop('checked', false);
            }
            $("#update_stu_age").val(ret['stu_age']);
            $("#update_stu_origin").val(ret['stu_origin']);
            $("#update_stu_profession").val(ret['stu_profession_id']);
        });

    } else if ($tbr.find('input:checked').length === 0) {
        toastr.error('请选择一个学生的信息进行修改！');
    } else {
        toastr.error('只能选择一个学生的信息进行修改！');
    }

});

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
                    Pagebtn();
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

$("#btn_del").click(function () {
    let $tbr = $('table tbody tr');
    if ($tbr.find('input:checked').length == 0) {
        toastr.error('请选择需要删除的学生信息！');
    } else {
        $("#delModalLabel").text("删除学生信息");
        $('#delModal').modal();
        let studelid = new Array();
        for (let i = 0; i < ($tbr.find('input:checked').length); i++) {
            studelid[i] = $tbr.find('input:checked')[i]['id'];
        }
        let studelidstr = studelid.toString();
        $('#delInfoId').html(studelidstr);
    }

});

function delSub() {
    let $tbr = $('table tbody tr');
    let studelid = new Array();
    for (let i = 0; i < ($tbr.find('input:checked').length); i++) {
        studelid[i] = $tbr.find('input:checked')[i]['id'];
    }
    for (let i = 0; i < ($tbr.find('input:checked').length); i++) {
        $.get("/del/" + studelid[i].toString(), function (result) {
            console.log(result)
            if (result['code'] === 200) {
                toastr.success('删除学号为' + studelid[i].toString() + "的数据成功!");
            } else toastr.error('删除学号为' + studelid[i].toString() + "的数据失败!");
        });
    }
    Pagebtn();
}

/*
获取被选中的学号
var $tbr = $('table tbody tr');
for(let i=0;i<($tbr.find('input:checked').length);i++) {
    console.log($tbr.find('input:checked')[i]['id']);
}
delInfoId
 */
