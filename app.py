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


class stu_profession(db.Model):
    stu_profession_id = db.Column(db.Integer, primary_key=True)
    stu_profession = db.Column(db.String(50))


class student_info(db.Model):
    __tablename__ = "student_info"
    stu_id = db.Column(db.Integer, primary_key=True)
    stu_name = db.Column(db.String(50))
    stu_sex = db.Column(db.String(2))
    stu_age = db.Column(db.Integer)
    stu_origin = db.Column(db.String(50))
    stu_profession_id = db.Column(db.Integer, db.ForeignKey("stu_profession.stu_profession_id"))
    stu_profession = db.relationship("stu_profession")


def student_to_dict(student_info):
    return dict(
        stu_id=student_info.stu_id,
        stu_name=student_info.stu_name,
        stu_sex=student_info.stu_sex,
        stu_age=student_info.stu_age,
        stu_origin=student_info.stu_origin,
        stu_profession=student_info.stu_profession.stu_profession,
    )


def MergeDict(dict1, dict2):
    res = {**dict1, **dict2}
    return res


def CheckLogin():
    if 'username' not in session:
        return False
    else:
        return True


@app.route('/login', methods=['POST', 'GET'])
def login():
    if request.method == "GET":
        ret = {'username': '', 'pwd': '', 'hidden': 'none'}
        return render_template('login.html', ret=ret)
    result, _ = GetSql2("select * from users where username='%s'" % request.form['username'])
    print(result)
    if len(result) > 0 and result[0][1] == request.form['pwd'] and captcha.validate():
        session["username"] = request.form['username']
        return redirect(url_for('index'))
    else:
        ret = {'username': request.form['username'], 'pwd': request.form['pwd'], 'hidden': 'block'}
        return render_template('login.html', ret=ret)


@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))


@app.route('/', methods=['GET'])
def index():
    if not CheckLogin():
        return redirect(url_for('login'))

    return render_template('show.html')


@app.route('/showinfo', methods=['GET'])
def showinfo():
    if not CheckLogin():
        return redirect(url_for('login'))

    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 5))

    name = str(request.args.get('name', ""))
    stuno = str(request.args.get('stuno', ""))

    # filter(student_info.stu_name.like('%%%s%%' % name)).\
    # filter(student_info.stu_id.like('%%%s%%' % stuno)).\
    if name == "" and stuno == "":
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

    stus = paginate.items
    ret = []
    i = 1
    for stu in stus:
        # print(student_to_dict(stu))
        # print(i)
        # dictid = {'No': i}
        # print(MergeDict(dictid, student_to_dict(stu)))
        ret.append(student_to_dict(stu))
        # i = i + 1

    # print(ret)
    # print(type(ret))
    # print(student_to_dict(stus))

    ret_paginate = {'has_prev': ('yes' if paginate.has_prev else 'no'), 'prev_num': paginate.prev_num,
                    'pages': paginate.pages, 'next_num': paginate.next_num, 'total': paginate.total,
                    'per_page': per_page, 'page': paginate.page}
    # ret.append(ret_paginate)

    return jsonify({'stuinfo': json.dumps(ret, ensure_ascii=False), 'paginate': ret_paginate})


@app.route('/add', methods=['GET', 'post'])
def add():
    if not CheckLogin():
        return redirect(url_for('login'))

    if request.method == "GET":

        datas, _ = GetSql2("select * from stu_profession")
        # print(datas)
        # print(type(datas))
        return dict(datas)
        # return render_template('add.html', datas=datas)
        # return render_template('add.html')

    else:
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
            InsertData(data, "student_info")
            res = {'code': 200, 'message': '成功添加！'}
        else:
            res = {'code': 500, 'message': '添加失败！'}

        # InsertData(data, "student_info")
        # res = {'code': 200, 'message': '成功添加！'}
        return json.dumps(res, ensure_ascii=False)


@app.route('/update', methods=['GET', 'post'])
def update():
    if not CheckLogin():
        return redirect(url_for('login'))
    if request.method == "GET":
        stuid = request.args['id']
        result, _ = GetSql2("select * from student_info where stu_id='%s'" % stuid)

        ret = {'stu_id': result[0][0], 'stu_name': result[0][1], 'stu_sex': result[0][2],
               'stu_age': result[0][3], 'stu_origin': result[0][4], 'stu_profession_id': result[0][5]}
        print(ret)
        return ret
    else:
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


@app.route('/del/<id>', methods=['GET'])
def delete(id):
    if not CheckLogin():
        return redirect(url_for('login'))

    DelDataById("stu_id", id, "student_info")
    res = {'code': 200, 'message': '成功添加！'}
    return res


if __name__ == '__main__':
    app.run(debug=True)
