from py_fumen.decoder import decode
import csv

#csv展開
with open(r"C:\Users\sakur\Desktop\TFDB\test\FumenInfor_202405132123.csv") as FumenInfor:
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
    page_count=1
    for decoded_page in decoded_fumen:
        #1ページをエンコード　or 空白ページをカウント、01処理を入れる
        test=decoded_page.get_field().string()
        breakpoint()
    #FumenPage配列にappendする
    #csvファイルを作成