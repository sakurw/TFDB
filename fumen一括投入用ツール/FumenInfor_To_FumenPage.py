from py_fumen_py import *
import csv

#csv展開
with open(r"path") as FumenInfor:
    FumenInfor_table=[row for row in csv.reader(FumenInfor)]

#FumenPageの二次配列作成[行（1ページ1行）、列（譜面ID、ページ数、ページ単位の譜面、01処理）]
FumenPage_table=[]
#行数分ループ
for FumenInfor_row in FumenInfor_table:
    # 1譜面をデコード、譜面IDを取得する
    fumen_id=FumenInfor_row[0]
    if fumen_id=="FumenId":
        continue
    decoded_fumen=decode(FumenInfor_row[1])
    #譜面ページ分ループ（ページ数カウンターをセット）
    page_count=0
    for decoded_page in decoded_fumen:

        page_count=page_count+1
        field01=""
        #01処理を入れる　or 空白ページスキップ
        decoded_field=decoded_page.field.string()
        if decoded_field=="__________":
            continue
        for char in decoded_field:
            if char=="_":
                field01=field01+"0"
            elif char=="\n":
                continue
            else:
                field01 = field01 + "1"
        # FumenPage配列にappendする、中でencode
        FumenPage_table.append([fumen_id,page_count,encode([decoded_page]),field01])
    #FumenInfor用のページ出力
    print(page_count)
    # csvファイルを作成
with open(r"path","w",encoding="utf-8") as FumenPage:
    for row in FumenPage_table:
        FumenPage.write(str(row).translate(str.maketrans({"[":"","]":"","'":""})))
        FumenPage.write("\n")
