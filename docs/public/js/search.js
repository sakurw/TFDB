import { sidebarjs } from "../sidebar/sidebar.js";

/*
各パラメータ取得
CLEARボタン
SEARCHボタン
 */


//Field Stage生成
const mino_scale = 22
const field = new PIXI.Application({
    width: 10 * mino_scale,
    height: 24 * mino_scale,
    backgroundColor: 0xffffff,
    resolution: 1,
    autoDensity: true
});
field.stage.interactive = true;
field.stage.on('pointerup', onDragEnd);
field.stage.on('pointerupoutside', onDragEnd);

//罫線配置
function drawGrid(height, width) {
    const grid_graphic = new PIXI.Graphics();
    grid_graphic.lineStyle(2, 0x4d4d4d, .6);

    for (let col_grid_start = mino_scale; col_grid_start <= (width - 1) * mino_scale; col_grid_start += mino_scale) {
        grid_graphic.moveTo(col_grid_start, 0);
        grid_graphic.lineTo(col_grid_start, height * mino_scale);
    }
    for (let row_grid_start = mino_scale; row_grid_start <= height * mino_scale; row_grid_start += mino_scale) {
        grid_graphic.moveTo(0, row_grid_start);
        grid_graphic.lineTo(width * mino_scale, row_grid_start);
    }
    grid_graphic.lineStyle();
    grid_graphic.lineStyle(2, 0xffffff);
    if (height > 20) {
        grid_graphic.moveTo(0, (height - 20) * mino_scale);
        grid_graphic.lineTo(width * mino_scale, (height - 20) * mino_scale);
    }
    grid_graphic.moveTo(0, (height - 1) * mino_scale);
    grid_graphic.lineTo(width * mino_scale, (height - 1) * mino_scale);
    grid_graphic.lineStyle();
    field.stage.addChild(grid_graphic);
}

//field上の操作
let blocks = [];
let Dragging = false;
let dragColor;
function onBlockClick(event) {
    const block = event.currentTarget;
    block.tint = block.tint === 0x000000 ? 0x999999 : 0x000000;
    Dragging = true;
    dragColor = block.tint;
}

function onBlockOver(event) {
    if (Dragging) {
        const block = event.currentTarget;
        block.tint = dragColor;
    }
}

function onDragEnd() {
    Dragging = false;
}

//ブロック配置
function drawBlock(height, width) {
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const block_graphics = new PIXI.Graphics();
            block_graphics.beginFill(0xffffff);
            block_graphics.drawRect(0, 0, mino_scale, mino_scale);
            block_graphics.endFill();
            block_graphics.tint = 0x000000;
            block_graphics.x = x * mino_scale;
            block_graphics.y = y * mino_scale
            block_graphics.interactive = true;
            block_graphics.buttonMode = true;

            block_graphics.on('pointerdown', onBlockClick);
            block_graphics.on('pointerover', onBlockOver);
            block_graphics.on('pointerup', onDragEnd);
            block_graphics.on('pointerupoutside', onDragEnd);

            field.stage.addChild(block_graphics)
            blocks.push(block_graphics);
        }
    }
}
//盤面をNull化
function drawNull() {
    blocks = []
    field.stage.removeChildren();
    field.renderer.resize(220, 175)
    const null_text = new PIXI.Text();
    null_text.text = 'FIELD DATA\n IS NULL';
    null_text.style.fontFamily = 'consolas';
    null_text.style.fontSize = 20;
    null_text.style.fill = 0x000000;
    null_text.style.align = 'center';
    null_text.anchor.x = 0.5;
    null_text.anchor.y = 0.5;
    null_text.position.set(110, 87.5);
    field.stage.addChild(null_text);
}

//盤面生成
function generatefield() {
    const fieldWidthInput = document.getElementById("FieldWidth")
    const fieldHeightInput = document.getElementById("FieldHeight")
    const FieldToggleSwitch = document.getElementById("FieldToggleSwitch")
    const exactOnly = document.getElementById("exactOnly")
    const exactOnlyText = document.getElementById("exactOnlyText")

    const width = parseInt(fieldWidthInput.value, 10);
    const height = parseInt(fieldHeightInput.value, 10);

    field.stage.removeChildren();

    if (width == 10 || isNaN(width)) {
        FieldToggleSwitch.style.display = "block"
        exactOnly.style.display = "none"
        exactOnlyText.style.display = "none"
    }
    else {
        FieldToggleSwitch.style.display = "none"
        FieldToggleSwitch.classList.add('active')
        exactOnly.style.display = "block"
        exactOnlyText.style.display = "block"
    }

    if (!isNaN(width) && !isNaN(height) && width >= 2 && width <= 10 && height >= 2 && height <= 24) {
        field.renderer.resize(width * mino_scale, height * mino_scale);
        drawBlock(height, width);
        drawGrid(height, width);
    }
    else {
        drawNull();
    }
}

//FieldReset
function fieldreset() {
    const fieldWidthInput = document.getElementById("FieldWidth")
    const fieldHeightInput = document.getElementById("FieldHeight")
    blocks = []
    field.stage.removeChildren();
    fieldHeightInput.value = ""
    fieldWidthInput.value = ""
    drawNull();
}

//FieldErase
function fielderase() {
    blocks = []
    field.stage.removeChildren();
    generatefield();
}


//users呼び出し
let firstCall = true;
async function callusers() {
    const popWindow = document.getElementById("popWindow")
    const popContent = popWindow.children[0];
    const loadingWindow = document.getElementById("loadingWindow")
    popWindow.style.display = "block";
    loadingWindow.style.display = "block";
    if (firstCall == true) {
        try {
            const response = await fetch("http://localhost:5500/api/users", { method: "GET", headers: { 'Content-Type': "application/json" } });
            const status = response['status']
            const data = await response.json();
            if (status == 200) {
                const table = document.getElementById("userTableBody")
                data["data"].forEach((user) => {
                    const row = document.createElement("tr");

                    const radioCell = document.createElement("td");
                    const radio = document.createElement("input");
                    radio.type = "radio";
                    radio.name = "user";
                    radio.value = user[0];
                    radioCell.appendChild(radio);
                    row.appendChild(radioCell);
                    const idCell = document.createElement("td");
                    idCell.textContent = String(user[0])
                    row.appendChild(idCell);
                    const nameCell = document.createElement("td");
                    nameCell.textContent = user[1]
                    row.appendChild(nameCell);
                    table.appendChild(row);
                });
            }
            else {
                console.log(String(status) + "：" + data["message"] + "\n開発者に以下の情報を添付して連絡してください\n・このコンソール画面\n・入力したパラメータ全て\n・直前に行った行動")
            }
        }
        catch (error) {
            console.log(error);
        }
        firstCall = false;
    }
    loadingWindow.style.display = "none";
    popContent.style.display = "block";

}
//選択user入力
function userinput() {
    const popWindow = document.getElementById("popWindow")
    const popContent = popWindow.children[0];
    const selectedRadio = document.querySelector('input[name="user"]:checked');
    const DiscordIdInput = document.getElementById('DiscordId');
    if (selectedRadio) {
        DiscordIdInput.value = selectedRadio.value;
    }
    popContent.style.display = "none";
    popWindow.style.display = "none";
}

//読み込み後呼び出し
document.addEventListener('DOMContentLoaded', function () {
    fetch('../public/sidebar/sidebar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('sidebar_contena').innerHTML = data;
            sidebarjs();
        })
    document.getElementById("Field").appendChild(field.view);
    drawNull();

    //user呼び出し関係
    const callUsersButton = document.getElementById("userTableButton");
    const userSelect = document.getElementById("userSelect")
    callUsersButton.addEventListener("click", callusers);
    userSelect.addEventListener("click", userinput);

    //ローディング
    const popWindow = document.getElementById("popWindow")
    const popContent = popWindow.children[0];
    const popClose = document.getElementById("popClose")
    popClose.addEventListener("click", function () {
        popContent.style.display = "none"
        popWindow.style.display = "none";
    })

    //盤面生成関係
    const fieldWidthInput = document.getElementById("FieldWidth")
    const fieldHeightInput = document.getElementById("FieldHeight")
    fieldHeightInput.addEventListener('input', generatefield);
    fieldWidthInput.addEventListener('input', generatefield);

    //FieldReset
    const fieldReset = document.getElementById("FieldReset")
    fieldReset.addEventListener("click", fieldreset)

    //FieldErase
    const fieldErase = document.getElementById("FieldErase")
    fieldErase.addEventListener("click", fielderase)

    //各アコーディオン切り替え
    document.querySelectorAll(".group-button").forEach(
        button => {
            button.addEventListener("click", function () {
                const GroupContent = button.nextElementSibling;

                this.classList.toggle("active");
                GroupContent.style.display = this.classList.contains("active") ? "block" : "none";
            })
        }
    );

    //各Switch切り替え
    const TitleToggleSwitch = document.getElementById("TitleToggleSwitch");
    const MirrorToggleSwitch = document.getElementById("MirrorToggleSwitch");
    const FieldToggleSwitch = document.getElementById("FieldToggleSwitch");

    TitleToggleSwitch.addEventListener("click", function () {
        TitleToggleSwitch.classList.toggle("active");
    });

    MirrorToggleSwitch.addEventListener("click", function () {
        MirrorToggleSwitch.classList.toggle("active");
    });

    FieldToggleSwitch.addEventListener("click", function () {
        FieldToggleSwitch.classList.toggle("active");

    });

});

//loading画面
const colors = ['#00fafa', '#f002f0', '#02d902', '#f00202', '#e89b02', '#0000ff', '#f7f70a'];

function changeBlockColors() {
    const blocks = document.querySelectorAll('.block');
    const color = colors[Math.floor(Math.random() * colors.length)];
    blocks.forEach(block => {
        block.style.backgroundColor = color
    });
}
document.getElementById("loadingT").addEventListener("animationiteration", changeBlockColors);
changeBlockColors();


