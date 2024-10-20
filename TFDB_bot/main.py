import datetime
import re
import requests
import json
import discord
from discord.ext import tasks

# サーバーにアップロードした際にpathを変える
with open(r"C:\Users\sakur\Desktop\TFDB\discord_token.txt", "r") as discord_file:
    token = discord_file.read()
with open(r"C:\Users\sakur\Desktop\TFDB\URL_API_Key.txt", "r") as URL_API_file:
    API_key = URL_API_file.read()

intents = discord.Intents.all()
client = discord.Client(intents=intents)


async def AddFumenFunction(embed_content):
    fumen=embed_content.fields[0].value
    title=embed_content.fields[1].value
    fumenType=0
    option_index=0
    for option in embed_content.fields[2].value.splitlines():
        option_index+=1
        if option.startswith("<:dynoSuccess:"):
            fumenType=option_index
            break
    fumenTimming=0
    option_index=0
    for option in embed_content.fields[3].value.splitlines():
        option_index += 1
        if option.startswith("<:dynoSuccess:"):
            fumenTimming = option_index
            break
    comment=embed_content.fields[4].value

    authorID=int(embed_content.author.proxy_icon_url.split('/')[-2])
    #URLが含まれているかチェック
    if 'http//:' in title or 'https://' in title or 'http//:' in comment or 'https://' in comment :
        return [False, 'dont use URL']
    #譜面コードかチェック
    if not (re.match(r'^v(115@|110@|105@|100@|095@|090@)[A-Za-z0-9+/?]+$', fumen)):
        return [False, 'plz fumen code']
    
    #API
    headers={'Authorization':API_key}
    param = {'FumenCode': fumen, 'Title': title, 'Comment': comment,
                      'DiscordId': authorID, 'FumenTypeId': fumenType, 'TimeTypeId': fumenTimming}
    response = requests.post("https://tfdbapi.com/addfumen", headers=headers,json=param)
    #jsonの中身確認
    breakpoint()
    if response.status_code!=200:
        return [False,response.text.split('"')[-2]]
    else:
        return [True,""]
    breakpoint()
    



def BackupDBFunction():
    print("backup")


@client.event
async def on_ready():
    loop.start()


# UTC19:00(JST4:00)にバックアップ実行
@tasks.loop(time=datetime.time(hour=19))
async def loop():
    BackupDBFunction()


@client.event
async def on_message(message):  # ちゃんねるID2つを変える
    print(message.author.id)
    print(message.channel.id)
    if message.author.id == 1241629361459691582 and message.channel.id == 1241620152533909524:
        result=await AddFumenFunction(message.embeds[0])
        if not result[0]:
            await message.channel.send(result[1])


client.run(token)
