import { sidebarjs } from "../sidebar/sidebar.js";

var test = process.env.TEST;

const mino_scale = 22
const field_width = mino_scale * 10;
const field_height = mino_scale * 24;
const field = new PIXI.Application({
    width: field_width,
    height: field_height,
    backgroundColor: 0x000000,
    resolution: 1,
    autoDensity: true,
});
field.stage.interactive = true;
field.stage.on('pointerup', onDragEnd);
field.stage.on('pointerupoutside', onDragEnd);


function drawGrid() {
    const grid_graphic = new PIXI.Graphics();
    grid_graphic.lineStyle(2, 0x4d4d4d, .6);

    for (let col_grid_start = mino_scale; col_grid_start <= 9 * mino_scale; col_grid_start += mino_scale) {
        grid_graphic.moveTo(col_grid_start, 0);
        grid_graphic.lineTo(col_grid_start, field_height);
    }
    for (let row_grid_start = mino_scale; row_grid_start <= 24 * mino_scale; row_grid_start += mino_scale) {
        grid_graphic.moveTo(0, row_grid_start);
        grid_graphic.lineTo(field_width, row_grid_start);
    }
    grid_graphic.lineStyle();
    grid_graphic.lineStyle(2, 0xffffff);
    grid_graphic.moveTo(0, 3 * mino_scale);
    grid_graphic.lineTo(field_width, 3 * mino_scale);
    grid_graphic.moveTo(0, 23 * mino_scale);
    grid_graphic.lineTo(field_width, 23 * mino_scale);
    grid_graphic.lineStyle();
    field.stage.addChild(grid_graphic);

}

let blocks = [];
let Dragging = false;
let dragColor;
//field上の操作
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
function drawBlock() {
    for (let y = 0; y < 24; y++) {
        for (let x = 0; x < 10; x++) {
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

function drawNull() {
    const null_text = new PIXI.Text();
    null_text.text = 'NULL';
    null_text.style.fontFamily = 'consolas';
    null_text.style.fontSize = 30;
    null_text.style.fill = 0xffffff;
    null_text.style.align = 'center';
    null_text.anchor.x = 0.5;
    null_text.anchor.y = 0.5;
    null_text.position.set(field_width / 2, field_height / 2);
    field.stage.addChild(null_text);
}

//users呼び出し
let firstCall = true;
function callusers() {
    if (firstCall == true) {
        let users = [[435, "test"], [5436, "ggg"], [399283025898242051, "ggg"], [5436, "ggg"], [5436, "ggg"], [5436, "ggg"], [5436, "ggg"], [5436, "ggg"], [5436, "ggg"]]
        const table = document.getElementById("userTable")
        users.forEach((user) => {
            const row = document.createElement("tr");

            const radioCell = document.createElement("td");
            const radio = document.createElement("input");
            radio.type = "radio";
            radio.name = "user";
            radioCell.appendChild(radio);
            row.appendChild(radioCell);
            const idCell = document.createElement("td");
            idCell.textContent = String(user[0])
            row.appendChild(idCell);
            const nameCell = document.createElement("td");
            nameCell.textContent = user[1]
            row.appendChild(nameCell);
            table.appendChild(row);
            firstCall = false;
        });
    }
    const popWindow = document.getElementById("popWindow")
    popWindow.style.display = "block";
}


document.addEventListener('DOMContentLoaded', function () {
    fetch('../sidebar/sidebar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('sidebar_contena').innerHTML = data;
            sidebarjs();
        })

    document.getElementById("Field").appendChild(field.view);
    drawNull();

    const callUsersButton = document.getElementById("userTableButton");
    const popWindow = document.getElementById("popWindow")
    const popClose = document.getElementById("popClose")

    callUsersButton.addEventListener("click", callusers);
    popClose.addEventListener("click", function () {
        popWindow.style.display = "none";
    })

});

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
