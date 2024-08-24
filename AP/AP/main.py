import hashlib
import json
import re
import os
from flask import Flask, request, Response
from flask_restful import Resource, Api
from flask_cors import CORS
import mysql.connector.pooling
from datetime import datetime
import py_fumen_py

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "https://tfdb.onrender.com/"}}, methods=["GET", "POST"]
     , allow_headers=["Content-Type", "Authorization"], supports_credentials=True, max_age=1800, send_wildcard=False,
     vary_header=True)
api = Api(app)

dbconfig = {"database": "TFDB", "user": os.getenv('DB_USER'), "password": os.getenv('DB_PASSWORD'), "host": os.getenv('DB_HOST')}
salt = os.getenv('SALT')
salted_hashed_key = os.getenv('HASHED_SALTED_KEY')
hashed_count=int(os.getenv('HASHED_COUNT'))
cryption=os.getenv('CRYPTION')
pool = mysql.connector.pooling.MySQLConnectionPool(pool_name="TFDBConectPool", pool_size=2, **dbconfig)


# APIキーチェック関数
def token_check(token):
    if hashlib.pbkdf2_hmac(cryption, token.encode(), salt.encode(), hashed_count).hex() == salted_hashed_key:
        return True
    else:
        return False


# SQL実行関数
def exe_SQL(code, params, date_flag):
    db = pool.get_connection()
    cursor = db.cursor()
    try:
        cursor.execute(code, params)
    except mysql.connector.IntegrityError:
        return [False, '']
    except mysql.connector.Error as Error:
        return [False, '']
    results = []

    while True:
        try:
            result = cursor.fetchall()
            results.append(result)
            if not cursor.nextset():
                break
        except mysql.connector.errors.InterfaceError:
            continue

    db.close()
    if date_flag is True:
        # タプルのままdatetime型のJSONシリアライズを回避できないため、一旦listに変換
        result_list = []
        for row in results[0]:
            row_list = list(row)
            if isinstance(row_list[7], datetime):
                row_list[7] = row_list[7].isoformat()
            result_list.append(tuple(row_list))
        return [True, result_list]
    else:
        return [True, results]


# UserDialog用
class User(Resource):

    def get(self):
        params = {'api_key': request.headers.get('Authorization', 'incorrectdefault')}
        if not (len(params) == 1 and 'api_key' in params):
            return [False, 'Invalid parameter (Caused by Number of parameters or unknown parameter)']
        if not token_check(params['api_key']):
            return Response(response=json.dumps({'data': "", 'message': "Incorrect API key"}), status=403)
        result = exe_SQL("SELECT * FROM `User`", [], False)
        if result[0] is False:
            return Response(
                response=json.dumps({'data': "", 'message': "SQL error"}),
                status=400)
        return Response(response=json.dumps({'data': result[1][0], 'message': "success"}), status=200)


# 検索（ID検索以外）
# FumenType,TimeType,DiscordId,RegisterTimeFrom,RegisterTimeTo,PageFrom,PageTo,Title（Like文）,
# Title一致フラグ（0：完全、1：部分）,Fumen01（副問合）,Fumen01反転フラグ,Fumen01Width
# json形式で引数を受け取る
class Search(Resource):
    correct_params = {'FumenTypeId': 'int', 'TimeTypeId': 'int', 'DiscordId': 'int',
                      'PageFrom': 'int',
                      'PageTo': 'int', 'RegisterTimeFrom': 'str', 'RegisterTimeTo': 'str',
                      'Title': 'str', 'TitleOption': 'int', 'Fumen01': 'str', 'Fumen01Option':'int','Fumen01Width': 'int',
                      'Fumen01Mirror': 'int'}

    # Fumen01用文字種チェック関数
    def valid_string_for_Fumen01(self, code):
        for character in code:
            if not (character == '0' or character == '1'):
                return False
        return True

    # paramチェック関数
    def param_check(self, params):
        # パラメータの数が不正でないか、各パラメータが全て存在しているか
        if not (len(params) == 13 and all(correct_params in params for correct_params in self.correct_params.keys())):
            return [False, 'Invalid parameter (Caused by Number of parameters or unknown parameter)']
        # 各パラメータの型が対応した型もしくは0か
        for param_key in params.keys():
            if not (type(params[param_key]).__name__ == self.correct_params[param_key] or params[param_key] == 0):
                return [False, 'Invalid parameter (Caused by Invalid type)']
        # From-Toチェック
        if not (params['PageFrom'] <= params['PageTo']
                or datetime.strptime(params['RegisterTimeFrom'], '%Y/%m/%d') <= datetime.strptime(
                    params['RegisterTimeTo'], '%Y/%m/%d')):
            return [False,
                    'Invalid parameter (Caused by "PageFrom" and "PageTo" or "RegisterTimeFrom" and "RegisterTo")']
        # 各Optionチェック
        if not ((params['TitleOption'] == 0 or params['TitleOption'] == 1) and (
                params['Fumen01Mirror'] == 0 or params['Fumen01Mirror'] == 1) and
                (params['Fumen01Option'] == 0 or params['Fumen01Option'] == 1)):
            return [False, 'Invalid parameter (Caused by "TitleOption", "Fumen01Mirror" or "Fumen01Option")']
        # datetimeチェック
        if not ((params[
                     'RegisterTimeFrom'] == 0 or re.fullmatch(
            r'^\d{4}([-\/])(0[1-9]|1[0-2]|[1-9])\1(0[1-9]|[1-9]|[12][0-9]|3[01])$',
            params['RegisterTimeFrom']) is not None) and (params['RegisterTimeTo'] == 0
                                                          or re.fullmatch(
                    r'^\d{4}([-\/])(0[1-9]|1[0-2]|[1-9])\1(0[1-9]|[1-9]|[12][0-9]|3[01])$',
                    params['RegisterTimeTo']) is not None)):
            return [False, 'Invalid parameter (Caused by "RegisterTimeFrom", "RegisterTimeTo" or both)']

        # Fumen01用チェック
        if params['Fumen01'] != 0 and params['Fumen01Width'] != 0:
            # Fumen01Widthに対して
            if not (2 <= params['Fumen01Width'] <= 10):
                return [False, 'Invalid parameter (Caused by "Fumen01Width")']
            # Fumen01に対して
            if not (len(params['Fumen01']) <= 240 and len(params['Fumen01']) % params['Fumen01Width'] == 0
                    and self.valid_string_for_Fumen01(params['Fumen01'])):
                return [False, 'Invalid parameter (Caused by "Fumen01" or "Fumen01Width")']
        elif (params['Fumen01'] == 0 and params['Fumen01Width'] != 0) \
                or (params['Fumen01'] != 0 and params['Fumen01Width'] == 0):
            return [False, 'Invalid parameter (Caused by "Fumen01" or "Fumen01Width")']

        return [True, '']

    # Fumen01正規表現作成関数
    def make_regexp(self, field01, width, reverse_step):
        char_index = 0
        regexp_string = '.*'
        while char_index <= len(field01) - 1:
            regexp_string += field01[char_index:char_index + width][::reverse_step] + '.{' + str(10 - width) + '}'
            char_index = char_index + width
        return regexp_string[:-3] + '*'

    def post(self):
        try:
            params = request.json
        except ValueError:
            Response(response=json.dumps({'data': "", 'message': "Requires JSON"}), status=400)
        params_check_result = self.param_check(params)
        if not params_check_result[0]:
            return Response(response=json.dumps({'data': "", 'message': params_check_result[1]}), status=400)
        API_key = request.headers.get('Authorization', 'incorrectdefault')
        if not token_check(API_key):
            return Response(response=json.dumps({'data': "", 'message': "Incorrect API key"}), status=403)
        sql_code = "SELECT FumenId,Title,FumenCode,Comment,FumenType,TimeType,DiscordName,RegisterTime FROM ForWEB WHERE"
        use_param_values = []
        AND_Flag = False

        for param in params.keys():
            # Id系統
            if param in ['FumenTypeId', 'TimeTypeId', 'DiscordId'] and params[param] != 0:
                if not AND_Flag:
                    sql_code += ' ' + param + ' = %s'
                    AND_Flag = True
                else:
                    sql_code += ' AND ' + param + ' = %s'
                use_param_values.append(params[param])
            # 範囲系統From
            elif param in ['PageFrom', 'RegisterTimeFrom'] and params[param] != 0:
                if not AND_Flag:
                    sql_code += ' ' + param[:-4] + ' >= %s'
                    AND_Flag = True
                else:
                    sql_code += ' AND ' + param[:-4] + ' >= %s'
                use_param_values.append(params[param])
            # 範囲系統To
            elif param in ['PageTo', 'RegisterTimeTo'] and params[param] != 0:
                if not AND_Flag:
                    sql_code += ' ' + param[:-2] + ' <= %s'
                    AND_Flag = True
                else:
                    sql_code += ' AND ' + param[:-2] + ' <= %s'
                use_param_values.append(params[param])
            # Title
            elif param == 'Title' and params[param] != 0:
                if not AND_Flag:
                    sql_code += ' ' + param + ' LIKE %s'
                    AND_Flag = True
                else:
                    sql_code += ' AND ' + param + ' LIKE %s'
                use_param_values.append(params[param] if params['TitleOption'] == 0 else '%' + params[param] + '%')
            # FumenCode01
            elif param == 'Fumen01' and params[param] != 0:
                if not AND_Flag:
                    sql_code += ' FumenId IN (SELECT DISTINCT FumenId FROM FumenPage fp WHERE FumenPage01 REGEXP %s )'
                    AND_Flag = True
                else:
                    sql_code += ' AND FumenId IN (SELECT DISTINCT FumenId FROM FumenPage fp WHERE FumenPage01 REGEXP %s )'
                # Fumen01Option !=0：部分一致の場合の正規表現
                if params['Fumen01Option'] != 0:
                    regexp_string = self.make_regexp(params['Fumen01'], params['Fumen01Width'], 1)
                    # 部分一致、反転時の処理
                    if params['Fumen01Mirror'] != 0:
                        regexp_string += '|' + self.make_regexp(params['Fumen01'], params['Fumen01Width'], -1)
                    params[param] = regexp_string
                # 完全一致、反転時の処理
                elif params['Fumen01Mirror'] != 0:
                    join_string = ''
                    char_index = 0
                    while char_index <= len(params['Fumen01']) - 1:
                        join_string += params['Fumen01'][char_index:char_index + params['Fumen01Width']][::-1]
                        char_index = char_index + params['Fumen01Width']
                    params['Fumen01'] += '|' + join_string

                use_param_values.append(params[param])
        if len(use_param_values) == 0:
            sql_code = sql_code[:-6]
        result = exe_SQL(sql_code + ';', use_param_values, True)
        if result[0] is False:
            return Response(
                response=json.dumps({'data': "", 'message': "Invalid parameter (SQL Error)"}),
                status=400)
        return Response(response=json.dumps({'data': result[1], 'message': "success"}),
                        status=200)


# 検索/searchid
class SearchId(Resource):
    correct_params = {'FumenId': 'int'}

    def param_check(self, params):
        # パラメータの数が不正でないか、各パラメータが全て存在しているか
        if not (len(params) == 1 and all(correct_params in params for correct_params in self.correct_params.keys())):
            return [False, 'Invalid parameter (Caused by Number of parameters or unknown parameter)']
        # 各パラメータの型が対応した型もしくは0か
        for param_key in params.keys():
            if not (type(params[param_key]).__name__ == self.correct_params[param_key]):
                return [False, 'Invalid parameter (Caused by Invalid type)']

        return [True, '']

    def post(self):
        try:
            params = request.json
        except ValueError:
            Response(response=json.dumps({'data': "", 'message': "Requires JSON"}), status=400)
        params_check_result = self.param_check(params)
        if not params_check_result[0]:
            return Response(response=json.dumps({'data': "", 'message': params_check_result[1]}), status=400)
        API_key = request.headers.get('Authorization', 'incorrectdefault')
        if not token_check(API_key):
            return Response(response=json.dumps({'data': "", 'message': "Incorrect API key"}), status=403)
        sql_code = "SELECT FumenId,Title,FumenCode,Comment,FumenType,TimeType,DiscordName,RegisterTime FROM ForWEB WHERE FumenId = %s;"
        result = exe_SQL(sql_code, [params['FumenId']], True)
        if result[0] is False:
            return Response(
                response=json.dumps({'data': "", 'message': "Invalid parameter (SQL Error)"}),
                status=400)
        return Response(response=json.dumps({'data': result[1], 'message': "success"}),
                        status=200)


# 登録
class AddFumen(Resource):
    correct_params = {'FumenCode': 'str', 'Title': 'str', 'Comment': 'str',
                      'DiscordId': 'int', 'FumenTypeId': 'int', 'TimeTypeId': 'int'}

    def param_check(self, params):

        # パラメータの数が不正でないか、各パラメータが全て存在しているか
        if not (len(params) == 6 and all(correct_param in params for correct_param in self.correct_params.keys())):
            return [False, 'Invalid parameter (Caused by Number of parameters or unknown parameter)']
        # 各パラメータの型が対応した型もしくは0か
        for param_key in params.keys():
            if not (type(params[param_key]).__name__ == self.correct_params[param_key]):
                return [False, 'Invalid parameter (Caused by Invalid type)']

        # Titleやコメント、譜面コードにURLが含まれていないか
        if 'http//:' in params['Title'] or 'https://' in params['Title'] or 'http//:' in params[
            'Comment'] or 'https://' in params['Comment'] or 'http//:' in params['FumenCode'] or 'https://' in params[
            'FumenCode']:
            return [False, 'Invalid parameter (Caused by URL in "Title", "Comment" or "FumenCode")']

        # Titleやコメントに譜面コードが含まれていないか
        if re.search(r'v(115@|110@|105@|100@|095@|090@)', params['Title']) or re.search(
                r'v(115@|110@|105@|100@|095@|090@)', params['Comment']):
            return [False, 'Invalid parameter (Caused by Fumen in "Title" or "Comment")']

        # FumenCodeが譜面コードか
        if not (re.match(r'^v(115@|110@|105@|100@|095@|090@)[A-Za-z0-9+/?]+$', params['FumenCode'])):
            return [False, 'Invalid parameter (Caused by "FumenCode")']
        # 以下をチェックするためのSQL
        result = exe_SQL('SELECT IF(EXISTS (SELECT 1 FROM ForWEB WHERE FumenCode = %s), 1, 0);' +
                         'SELECT IF(EXISTS (SELECT 1 FROM `User` WHERE DiscordId = %s), 1, 0);' +
                         'SELECT IF(EXISTS (SELECT 1 FROM FumenType WHERE FumenTypeId = %s), 1, 0);' +
                         'SELECT IF(EXISTS (SELECT 1 FROM TimeType WHERE TimeTypeId = %s), 1, 0);',
                         [params['FumenCode'], params['DiscordId'], params['FumenTypeId'], params['TimeTypeId']], False)
        if result[0] is False:
            return [False, 'Invalid parameter (SQL Error)']
        # 同一の譜面が存在しないか
        if result[1][0][0][0] == 1:
            return [False, 'The same fumen is exists']
        # DiscordIdが存在するか
        if result[1][1][0][0] == 0:
            return [False, 'Non-existent Discord ID']
        # FumenTypeIdが存在するか
        if result[1][2][0][0] == 0:
            return [False, 'Non-existent Fumen Type']
        # TimeTypeIdが存在するか
        if result[1][1][0][0] == 0:
            return [False, 'Non-existent Time Type']
        return [True, '']

    def post(self):
        try:
            params = request.json
        except ValueError:
            Response(response=json.dumps({'data': "", 'message': "Requires JSON"}), status=400)
        params_check_result = self.param_check(params)
        if not params_check_result[0]:
            return Response(response=json.dumps({'data': "", 'message': params_check_result[1]}), status=400)

        API_key = request.headers.get('Authorization', 'incorrectdefault')
        if not token_check(API_key):
            return Response(response=json.dumps({'data': "", 'message': "Incorrect API key"}), status=403)
        # fumen分解処理
        pages = []
        try:
            decoded_fumen = py_fumen_py.decode(params['FumenCode'])
        except:
            return Response(response=json.dumps({'data': "", 'message': 'Invalid parameter (Caused by fumen code)'}),
                            status=400)
        page_count = len(decoded_fumen)
        for decoded_page in decoded_fumen:
            field01 = ''
            decoded_field = decoded_page.field.string()
            if decoded_field == "__________":
                continue
            for char in decoded_field:
                if char == "_":
                    field01 = field01 + "0"
                elif char == "\n":
                    continue
                else:
                    field01 = field01 + "1"
            pages.append([py_fumen_py.encode([decoded_page]), field01])
        # FumenInforに占有ロック
        # FumenInforに追加
        # 追加したFumenId取得
        # 占有ロック解除
        result = exe_SQL('LOCK TABLES FumenInfor WRITE;' +
                         'INSERT INTO FumenInfor (FumenCode,Title,DiscordId,RegisterTime,Comment,TimeTypeId,FumenTypeId,Page) VALUES (%s,%s,%s,%s,%s,%s,%s,%s);' +
                         'SELECT MAX(FumenId) FROM FumenInfor;' +
                         'UNLOCK TABLES;',
                         [params['FumenCode'], params['Title'], params['DiscordId'], datetime.now(), params['Comment'],
                          params['TimeTypeId'], params['FumenTypeId'], page_count], False)
        if result[0] is False:
            return Response(response=json.dumps({'data': "", 'message': 'Invalid parameter (SQL Error)'}), status=400)
        # FumenPageに追加
        sql_code = 'INSERT INTO FumenPage(FumenId,FumenPage,FumenPageCode,FumenPage01) VALUES'
        add_pages_infor = []
        FumenId = result[1][2][0][0]
        page_index = 1
        for page in pages:
            if page_index != 1:
                sql_code = sql_code + ','
            sql_code = sql_code + ' (%s,%s,%s,%s)'
            add_pages_infor.append(FumenId)
            add_pages_infor.append(page_index)
            add_pages_infor.append(page[0])
            add_pages_infor.append(page[1])
            page_index = page_index + 1

        result = exe_SQL(sql_code + '; COMMIT;', add_pages_infor, False)
        if result[0] is False:
            return Response(response=json.dumps({'data': "", 'message': 'Invalid parameter (SQL Error)'}), status=400)
        return Response(response=json.dumps({'data': '', 'message': "success"}),
                        status=200)


api.add_resource(User, "/users")
api.add_resource(Search, "/search")
api.add_resource(SearchId, "/searchid")
api.add_resource(AddFumen, "/addfumen")
if __name__ == "__main__":
    app.run(debug=False,host='0.0.0.0',port=443)
