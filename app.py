from flask import Flask, render_template, request, url_for, redirect, session, jsonify
from dbSqlite3 import *
import uuid
import logging
import json
import re
from flask import Flask, request, render_template
from flask_sessionstore import Session
from flask_session_captcha import FlaskSessionCaptcha
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

# captcha
app.config["SECRET_KEY"] = uuid.uuid4()
app.config['CAPTCHA_ENABLE'] = True
app.config['CAPTCHA_NUMERIC_DIGITS'] = 5
app.config['CAPTCHA_WIDTH'] = 250
app.config['CAPTCHA_HEIGHT'] = 50
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db/student_083_2.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
app.config['SESSION_TYPE'] = 'sqlalchemy'
Session(app)
captcha = FlaskSessionCaptcha(app)

# captcha end

# SQLAlchemy对象创建

db = SQLAlchemy(app)


# 学生专业类
class stu_profession(db.Model):
    stu_profession_id = db.Column(db.Integer, primary_key=True)
    stu_profession = db.Column(db.String(50))


# 学生信息类
class student_info(db.Model):
    __tablename__ = "student_info"
    stu_id = db.Column(db.Integer, primary_key=True)
    stu_name = db.Column(db.String(50))
    stu_sex = db.Column(db.String(2))
    stu_age = db.Column(db.Integer)
    stu_origin = db.Column(db.String(50))
    stu_profession_id = db.Column(db.Integer, db.ForeignKey("stu_profession.stu_profession_id"))
    stu_profession = db.relationship("stu_profession")


# 将学生信息类信息转换为dict输出
def student_to_dict(student_info):
    return dict(
        stu_id=student_info.stu_id,
        stu_name=student_info.stu_name,
        stu_sex=student_info.stu_sex,
        stu_age=student_info.stu_age,
        stu_origin=student_info.stu_origin,
        stu_profession=student_info.stu_profession.stu_profession,
    )


# 检查是否登录
def CheckLogin():
    if 'username' not in session:
        return False
    else:
        return True


@app.route('/login', methods=['POST', 'GET'])
def login():
    if request.method == "GET":  # 初始情况下直接加载模板
        ret = {'username': '', 'pwd': '', 'hidden': 'none'}
        return render_template('login.html', ret=ret)
    # 如果是post请求，说明用户尝试登录
    # 从数据库获取查询结果
    result, _ = GetSql2("select * from users where username='%s'" % request.form['username'])
    print(result)
    # 用户名、密码、验证码全部验证成功，方可登录，否则登陆失败
    if len(result) > 0 and result[0][1] == request.form['pwd'] and captcha.validate():  # 登陆成功
        session["username"] = request.form['username']  # 使用session保存用户名
        return redirect(url_for('index'))  # 重定向到路由"/"
    else:  # 登陆成功,用户名和密码不清除
        ret = {'username': request.form['username'], 'pwd': request.form['pwd'], 'hidden': 'block'}
        return render_template('login.html', ret=ret)


# 清除session 登出操作
@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))


# 加载首页
@app.route('/', methods=['GET'])
def index():
    if not CheckLogin():  # 判断是否登录
        return redirect(url_for('login'))

    return render_template('show.html')


# 获取学生信息
@app.route('/showinfo', methods=['GET'])
def showinfo():
    if not CheckLogin():  # 检查是否登录
        return redirect(url_for('login'))

    page = int(request.args.get('page', 1))  # 当前页面编号
    per_page = int(request.args.get('per_page', 5))  # 当前页面显示几条信息

    name = str(request.args.get('name', ""))  # 用户查询所用的姓名
    stuno = str(request.args.get('stuno', ""))  # 用户查询所用的学号

    '''
    通过SQLAlchemy查询，query表示所查询的对象表，join表示所连接的表名称，filter相当于sql中where语句对查询进行筛选，
    orderby表示按列进行排序，这里以学号为顺序。paginate用来分页，page表示当前所在页，per_page表示每页展示的数据个数
    error_out表示是否对错误信息进行输出 like和sql中一样
    '''

    if name == "" and stuno == "":  # 没有查询关键字
        paginate = db.session.query(student_info).join(stu_profession). \
            filter(student_info.stu_profession_id == stu_profession.stu_profession_id). \
            order_by(student_info.stu_id).paginate(page, per_page, error_out=False)
    elif name != "" and stuno == "":
        paginate = db.session.query(student_info).join(stu_profession). \
            filter(student_info.stu_profession_id == stu_profession.stu_profession_id). \
            filter(student_info.stu_name.like('%%%s%%' % name)). \
            order_by(student_info.stu_id).paginate(page, per_page, error_out=False)
    elif name == "" and stuno != "":
        paginate = db.session.query(student_info).join(stu_profession). \
            filter(student_info.stu_profession_id == stu_profession.stu_profession_id). \
            filter(student_info.stu_id.like('%%%s%%' % stuno)). \
            order_by(student_info.stu_id).paginate(page, per_page, error_out=False)
    else:
        paginate = db.session.query(student_info).join(stu_profession). \
            filter(student_info.stu_profession_id == stu_profession.stu_profession_id). \
            filter(student_info.stu_name.like('%%%s%%' % name)). \
            filter(student_info.stu_id.like('%%%s%%' % stuno)). \
            order_by(student_info.stu_id).paginate(page, per_page, error_out=False)

    stus = paginate.items  # 获取分页得到的学生信息
    ret = []  # 存储格式化后的学生信息结果
    for stu in stus:  # 对获取到的所有学生信息遍历，以对单个学生信息类进行处理
        ret.append(student_to_dict(stu))  # 将处理后的结果存储到返回信息中

    '''
    向前端返回有关分页的信息，has_prev:是否为第一页，prev_num为前一页，pages为共有多少页，next_num为后一页
    total为总共的数据量，per_page为每页的数据量，page为当前页数
    '''

    ret_paginate = {'has_prev': ('yes' if paginate.has_prev else 'no'), 'prev_num': paginate.prev_num,
                    'pages': paginate.pages, 'next_num': paginate.next_num, 'total': paginate.total,
                    'per_page': per_page, 'page': paginate.page}

    return jsonify({'stuinfo': json.dumps(ret, ensure_ascii=False), 'paginate': ret_paginate})  # 返回学生信息和有关分页信息


# 添加学生信息操作
@app.route('/add', methods=['GET', 'post'])
def add():
    if not CheckLogin():
        return redirect(url_for('login'))
    if request.method == "GET":  # 通过get方法返回学生的专业信息
        datas, _ = GetSql2("select * from stu_profession")
        return dict(datas)
    else:  # post 请求方法
        # 从前端Ajax获取到的拟新增的学生信息并字典化
        data = dict(
            stu_id=request.form['stu_id'],
            stu_name=request.form['stu_name'],
            stu_sex=request.form['stu_sex'],
            stu_age=request.form['stu_age'],
            stu_origin=request.form['stu_origin'],
            stu_profession_id=request.form['stu_profession']
        )
        res = {'code': 500, 'message': '添加失败！'}  # 初始化返回结果为错误
        # 正则表达式判断获取的信息是否符合规范
        matchid = re.search(r'^\d{9,12}$', data['stu_id'])
        matchname = re.search(r'^[\u4e00-\u9fa5]{2,6}$', data['stu_name'])
        matchsex = re.search(r'^男$|^女$', data['stu_sex'])
        matchage = re.search(r'^\d{1,3}$', data['stu_age'])
        matchorigin = re.search(r'^[\u4e00-\u9fa5]{2,10}$', data['stu_origin'])
        matchprofession = re.search(r'^\d{1,3}$', data['stu_profession_id'])
        # 后台终端输出判断的测试以便调试
        print(matchid)
        print(matchname)
        print(matchsex)
        print(matchage)
        print(matchorigin)
        print(matchprofession)

        # 判断是否符合
        if matchid and matchname and matchsex and matchage and matchorigin and matchprofession:
            InsertData(data, "student_info")  # 符合则进行插入数据库操作
            res = {'code': 200, 'message': '成功添加！'}
        else:
            res = {'code': 500, 'message': '添加失败！'}

        # 返回结果
        return json.dumps(res, ensure_ascii=False)


# 修改学生信息操作
@app.route('/update', methods=['GET', 'post'])
def update():
    if not CheckLogin():
        return redirect(url_for('login'))
    if request.method == "GET":  # get请求用来进行从数据库获取要修改的学生的原始数据
        stuid = request.args['id']  # 从前端获取的学生学号
        result, _ = GetSql2("select * from student_info where stu_id='%s'" % stuid)  # 进行查询

        # 将通过sql查询的结果字典化 并作为返回值传给前端
        ret = {'stu_id': result[0][0], 'stu_name': result[0][1], 'stu_sex': result[0][2],
               'stu_age': result[0][3], 'stu_origin': result[0][4], 'stu_profession_id': result[0][5]}
        print(ret)
        return ret
    else:  # post请求用来进行修改 以下代码和上面add()的post请求方法一样
        data = dict(
            stu_id=request.form['stu_id'],
            stu_name=request.form['stu_name'],
            stu_sex=request.form['stu_sex'],
            stu_age=request.form['stu_age'],
            stu_origin=request.form['stu_origin'],
            stu_profession_id=request.form['stu_profession']
        )

        res = {'code': 500, 'message': '添加失败！'}

        matchid = re.search(r'^\d{9,12}$', data['stu_id'])
        matchname = re.search(r'^[\u4e00-\u9fa5]{2,6}$', data['stu_name'])
        matchsex = re.search(r'^男$|^女$', data['stu_sex'])
        matchage = re.search(r'^\d{1,3}$', data['stu_age'])
        matchorigin = re.search(r'^[\u4e00-\u9fa5]{2,10}$', data['stu_origin'])
        matchprofession = re.search(r'^\d{1,3}$', data['stu_profession_id'])
        print(matchid)
        print(matchname)
        print(matchsex)
        print(matchage)
        print(matchorigin)
        print(matchprofession)

        if matchid and matchname and matchsex and matchage and matchorigin and matchprofession:
            UpdateData(data, "student_info")
            res = {'code': 200, 'message': '成功添加！'}
        else:
            res = {'code': 500, 'message': '添加失败！'}

        # InsertData(data, "student_info")
        # res = {'code': 200, 'message': '成功添加！'}
        return json.dumps(res, ensure_ascii=False)


# 删除学生信息，根据单个id直接删除
@app.route('/del/<id>', methods=['GET'])
def delete(id):
    if not CheckLogin():
        return redirect(url_for('login'))

    DelDataById("stu_id", id, "student_info")  # 如果能正常执行则能正常删除，否则直接报错。
    res = {'code': 200, 'message': '成功添加！'}
    return res


# 主函数调用
if __name__ == '__main__':
    app.run(debug=True)
