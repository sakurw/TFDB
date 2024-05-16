from py_fumen.decoder import decode as fdecode
from py_fumen.encoder import encode as fencode
import codecs
import chardet
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
    decoded_fumen=fdecode("v115@LhA8IeA8IeA8OeAgWjBlvs2AWxDfEToHVBlvs2AWkg?6ASoPmDzCXTAVa2EB2XHDBwvnRAVa2EB2XHDBwvnRAVau6A?1XPDCGKjRAVau6AyXPDCGqnRAVau6A0XPDCG6gRAVaW3AxX?PDCG6MBA")#FumenInfor_row[1])
    #譜面ページ分ループ（ページ数カウンターをセット）
    page_count=0
    for decoded_page in decoded_fumen:
        #ユニコード化されたコメントを文字列に直す
        decoded_page.comment = codecs.decode(decoded_page.comment.replace("%u", "\\u"), "unicode_escape")

        page_count=page_count+1
        field01=""
        #01処理を入れる　or 空白ページスキップ
        decoded_field=decoded_page.get_field().string()
        if len(decoded_field)==0:
            continue
        for char in decoded_field:
            if char=="_":
                field01=field01+"0"
            elif char=="\n":
                continue
            else:
                field01 = field01 + "1"
        # FumenPage配列にappendする、中でencode
        FumenPage_table.append([fumen_id,page_count,fencode([decoded_page]),field01])

breakpoint()
    #csvファイルを作成
