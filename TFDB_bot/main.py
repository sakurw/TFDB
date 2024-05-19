import datetime
import requests
import json
import discord
from discord.ext import tasks

# サーバーにアップロードした際にpathを変える
with open(r"C:\Users\sakur\Desktop\TFDB\discord_token.txt", "r") as discord_file:
    token = discord_file.read()
with open(r"C:\Users\sakur\Desktop\TFDB\URL_API_Key.txt", "r") as URL_API_file:
    URL_API_key = URL_API_file.read()

intents = discord.Intents.all()
client = discord.Client(intents=intents)


# URLsはlistであること
async def URLCheckFunction(URLs):
    URLs_list = []
    URL_dict = {}
    for URL in URLs:
        URL_dict["url"] = URL
        URLs_list.append(URL_dict)
    data = {"threatInfo": {
        "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
        "platformTypes": ["ANY_PLATFORM"], "threatEntryTypes": ["URL"], "threatEntries": URLs_list}}
    get = requests.post("https://safebrowsing.googleapis.com/v4/threatMatches:find?key=%s" % URL_API_key,
                        data=json.dumps(data))
    # 結果表示
    print(json.dumps(get.json(), indent=4))


async def AddFumenFunction():
    print("DB追加")


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
    breakpoint()
    if message.author.id == "155149108183695360" and message.channel.id == "1241620152533909524":
        AddFumenFunction()
    elif message.channel.id == "1241649184914935859":
        URLCheckFunction()


client.run(token)
