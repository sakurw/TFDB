import { sidebarjs } from "../sidebar/sidebar.js";
import * as fumen from 'https://esm.run/tetris-fumen';

let results = [];
let detailButton;

const MINO_SCALE = 22;
const GRID_COLOR = 0x4d4d4d;
const GRID_ALPHA = 0.6;
const BORDER_COLOR = 0xffffff;

//上からblank,I,L,O,Z,T,J,S,garbage
const PIECE_COLORS = {
    0: 0x000000,
    1: 0x00fafa,
    2: 0xe89b02,
    3: 0xf7f70a,
    4: 0xf00202,
    5: 0xf002f0,
    6: 0x0000ff,
    7: 0x02d902,
    8: 0x999999
};

const PIECE_PATTERNS = {
    T: {
        spawn: [-1, 0, 10, 1],
        left: [-1, 0, 10, -10],
        right: [0, 10, -10, 1],
        reverse: [0, -1, -10, 1]
    },
    I: {
        spawn: [-1, 0, 1, 2],
        left: [-10, 0, 10, 20],
        right: [10, 0, -10, -20],
        reverse: [-2, -1, 0, 1]
    },
    O: {
        spawn: [0, 10, 1, 11],
        left: [-1, 0, 9, 10],
        right: [0, -10, -1, -11],
        reverse: [-11, -1, -10, 0]
    },
    S: {
        spawn: [-1, 0, 10, 11],
        left: [-1, 9, 0, -10],
        right: [0, 10, 1, -9],
        reverse: [-11, -10, 0, 1]
    },
    Z: {
        spawn: [0, 1, 10, 9],
        left: [0, 10, -1, -11],
        right: [0, -10, 1, 11],
        reverse: [-1, 0, -10, -9]
    },
    L: {
        spawn: [0, -1, 1, 11],
        left: [0, 9, 10, -10],
        right: [10, 0, -10, -9],
        reverse: [-1, -11, 0, 1]
    },
    J: {
        spawn: [0, 1, -1, 9],
        left: [0, -11, 10, -10],
        right: [10, 0, -10, 11],
        reverse: [1, -9, 0, -1]
    }
};

function drawGrid(field, minoScale, height, width) {
    const gridGraphic = new PIXI.Graphics();
    gridGraphic.lineStyle(2, GRID_COLOR, GRID_ALPHA);

    for (let i = 1; i < width; i++) {
        gridGraphic.moveTo(i * minoScale, 0);
        gridGraphic.lineTo(i * minoScale, height * minoScale);
    }
    for (let i = 1; i < height; i++) {
        gridGraphic.moveTo(0, i * minoScale);
        gridGraphic.lineTo(width * minoScale, i * minoScale);
    }

    gridGraphic.lineStyle(2, BORDER_COLOR);
    if (height > 20) {
        gridGraphic.moveTo(0, (height - 20) * minoScale);
        gridGraphic.lineTo(width * minoScale, (height - 20) * minoScale);
    }
    if (width === 10) {
        gridGraphic.moveTo(0, (height - 1) * minoScale);
        gridGraphic.lineTo(width * minoScale, (height - 1) * minoScale);
    }

    field.stage.addChild(gridGraphic);
}

let blocks = [];
let isDragging = false;
let dragColor;

function onBlockClick(event) {
    const block = event.currentTarget;
    block.tint = block.tint === 0x000000 ? 0x999999 : 0x000000;
    isDragging = true;
    dragColor = block.tint;
}

function onBlockOver(event) {
    if (isDragging) {
        event.currentTarget.tint = dragColor;
    }
}

function onDragEnd() {
    isDragging = false;
}

function drawBlock(field, minoScale, height, width) {
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const blockGraphics = new PIXI.Graphics();
            blockGraphics.beginFill(0xffffff);
            blockGraphics.drawRect(0, 0, minoScale, minoScale);
            blockGraphics.endFill();
            blockGraphics.tint = 0x000000;
            blockGraphics.position.set(x * minoScale, y * minoScale);
            blockGraphics.interactive = true;
            blockGraphics.buttonMode = true;

            blockGraphics
                .on('pointerdown', onBlockClick)
                .on('pointerover', onBlockOver)
                .on('pointerup', onDragEnd)
                .on('pointerupoutside', onDragEnd);

            field.stage.addChild(blockGraphics);
            blocks.push(blockGraphics);
        }
    }
}

function drawNull(field) {
    blocks = [];
    field.stage.removeChildren();
    field.renderer.resize(220, 175);
    const nullText = new PIXI.Text('FIELD DATA\n IS NULL', {
        fontFamily: 'consolas',
        fontSize: 20,
        fill: 0x000000,
        align: 'center'
    });
    nullText.anchor.set(0.5);
    nullText.position.set(110, 87.5);
    field.stage.addChild(nullText);
}

function generateField(field, minoScale) {
    const fieldWidthInput = document.getElementById("FieldWidth");
    const fieldHeightInput = document.getElementById("FieldHeight");
    const fieldToggleSwitch = document.getElementById("FieldToggleSwitch");
    const exactOnly = document.getElementById("exactOnly");
    const exactOnlyText = document.getElementById("exactOnlyText");

    const width = parseInt(fieldWidthInput.value, 10);
    const height = parseInt(fieldHeightInput.value, 10);

    field.stage.removeChildren();

    if (width === 10 || isNaN(width)) {
        fieldToggleSwitch.style.display = "block";
        exactOnly.style.display = "none";
        exactOnlyText.style.display = "none";
    } else {
        fieldToggleSwitch.style.display = "none";
        fieldToggleSwitch.classList.add('active');
        exactOnly.style.display = "block";
        exactOnlyText.style.display = "block";
    }

    if (!isNaN(width) && !isNaN(height) && width >= 2 && width <= 10 && height >= 2 && height <= 24) {
        field.renderer.resize(width * minoScale, height * minoScale);
        drawBlock(field, minoScale, height, width);
        drawGrid(field, minoScale, height, width);
    } else {
        drawNull(field);
    }
}

function fieldReset(field) {
    const fieldWidthInput = document.getElementById("FieldWidth");
    const fieldHeightInput = document.getElementById("FieldHeight");
    blocks = [];
    field.stage.removeChildren();
    fieldHeightInput.value = "";
    fieldWidthInput.value = "";
    drawNull(field);
    FieldToggleSwitch.style.display = "block";
    exactOnly.style.display = "none";
    exactOnlyText.style.display = "none";
}

function fieldErase(field, minoScale) {
    blocks = [];
    field.stage.removeChildren();
    generateField(field, minoScale);
}

let firstCall = true;
async function callUsers() {
    const popWindow = document.getElementById("popWindow");
    const popContent = popWindow.children[0];
    const loadingWindow = document.getElementById("loadingWindow");
    popWindow.style.display = "block";
    loadingWindow.style.display = "block";
    if (firstCall) {
        try {
            const response = await fetch("https://tfdb.onrender.com/api/users", { mode: 'cors', credentials: 'include', method: "GET", headers: { 'Content-Type': "application/json" } });
            const status = response.status;
            const data = await response.json();
            if (status === 200) {
                const table = document.getElementById("userTableBody");
                data.data.forEach((user) => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td><input type="radio" name="user" value="${user[0]}"></td>
                        <td>${user[0]}</td>
                        <td>${user[1]}</td>
                    `;
                    table.appendChild(row);
                });
            } else {
                console.log(`${status}: ${data.message}\n開発者に以下の情報を添付して連絡してください\n・このコンソール画面\n・入力したパラメータ全て\n・直前に行った行動`);
            }
        } catch (error) {
            console.log(error);
        }
        firstCall = false;
    }
    loadingWindow.style.display = "none";
    popContent.style.display = "block";
}

function userInput() {
    const popWindow = document.getElementById("popWindow");
    const popContent = popWindow.children[0];
    const selectedRadio = document.querySelector('input[name="user"]:checked');
    const discordIdInput = document.getElementById('DiscordId');
    if (selectedRadio) {
        discordIdInput.value = selectedRadio.value;
    }
    popContent.style.display = "none";
    popWindow.style.display = "none";
}

function getParams() {
    const params = {
        fumenID: parseInt(document.getElementById("FumenId").value) || 0,
        title: document.getElementById("Title").value.trim() || 0,
        titleOption: document.getElementById('TitleToggleSwitch').classList.contains("active") ? 1 : 0,
        discordId: parseInt(document.getElementById("DiscordId").value) || 0,
        registerDateFrom: document.getElementById("RegisterTimeFrom").value || 0,
        registerDateTo: document.getElementById("RegisterTimeTo").value || 0,
        pageFrom: parseInt(document.getElementById("PageFrom").value) || 0,
        pageTo: parseInt(document.getElementById("PageTo").value) || 0,
        fumenType: parseInt(document.getElementById("FumenType").value),
        timeType: parseInt(document.getElementById("TimeType").value),
        fumen01Width: parseInt(document.getElementById("FieldWidth").value) || 0,
        fumen01Mirror: document.getElementById('MirrorToggleSwitch').classList.contains("active") ? 1 : 0,
        fumen01Option: document.getElementById('FieldToggleSwitch').classList.contains("active") ? 1 : 0,
        fumen01: ""
    };

    let all0Flag = true;
    blocks.forEach(function (block) {
        if (block.tint === 0) {
            params.fumen01 += "0";
        } else {
            params.fumen01 += "1";
            all0Flag = false;
        }
    });

    if (all0Flag) {
        params.fumen01 = 0;
        params.fumen01Width = 0;
        params.fumen01Mirror = 0;
        params.fumen01Option = 0;
    }

    if (params.title === 0) {
        params.titleOption = 0;
    }

    let errorText = "";
    const fromDate = new Date(params.registerDateFrom);
    const toDate = new Date(params.registerDateTo);
    if (fromDate > toDate || params.pageFrom > params.pageTo) {
        errorText += '"Register date" or "Page" is invalid parameter(s)\n';
    }

    return errorText ? [-1, errorText] : Object.values(params);
}

async function search() {
    const bodyLabel = ["FumenID", 'Title', 'TitleOption', 'DiscordId', 'RegisterTimeFrom', 'RegisterTimeTo', 'PageFrom', 'PageTo', 'FumenTypeId', 'TimeTypeId', 'Fumen01', 'Fumen01Option', 'Fumen01Mirror', 'Fumen01Width'];
    const params = getParams();

    const popWindow = document.getElementById("popWindow");
    const loadingWindow = document.getElementById("loadingWindow");

    if (params[0] === -1) {
        alert(params[1]);
        return;
    }

    popWindow.style.display = "block";
    loadingWindow.style.display = "block";
    try {
        let response;
        if (params[0] === 0) {
            const bodyParam = {};
            for (let paramIndex = 1; paramIndex < params.length; paramIndex++) {
                bodyParam[bodyLabel[paramIndex]] = params[paramIndex];
            }
            response = await fetch("https://tfdb.onrender.com/api/search", { method: "POST", headers: { 'Content-Type': "application/json" }, body: JSON.stringify(bodyParam) });
        } else {
            response = await fetch("https://tfdb.onrender.com/api/searchid", { method: "POST", headers: { 'Content-Type': "application/json" }, body: JSON.stringify({ "FumenId": params[0] }) });
        }
        const status = response.status;
        const data = await response.json();
        if (status === 200) {
            results = data.data;
            const resultCount = document.getElementById("resultCount");
            const table = document.getElementById("resultBody");
            resultCount.textContent = `Result count: ${data.data.length}`;
            table.innerHTML = '';

            data.data.forEach((fumen_row, index) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${fumen_row[1]}</td>
                    <td><a href="https://knewjade.github.io/fumen-for-mobile/#?d=${fumen_row[2]}" target="_blank">Link</a></td>
                    <td>${fumen_row[4]}</td>
                    <td>${fumen_row[5]}</td>
                    <td><button class="action-button result-button" id="${index}"><i class="fas fa-file-alt"></i></button></td>
                `;
                table.appendChild(row);
            });
        } else {
            console.log(`${status}: ${data.message}\n開発者に以下の情報を添付して連絡してください\n・このコンソール画面\n・入力したパラメータ全て\n・直前に行った行動`);
        }
    } catch (error) {
        console.log(error);
    }
    popWindow.style.display = "none";
    loadingWindow.style.display = "none";

    detailButton = document.querySelectorAll('.result-button');
    detailButton.forEach(button => {
        button.addEventListener('click', () => callDetail(button.id));
    });
}

function drawFumen(field, page) {
    function selectColor(colorNum) {
        return PIECE_COLORS[colorNum] || 0x000000;
    }

    if (page.operation) {
        const typeNum = "ILOZTJS".indexOf(page.operation.type) + 1;
        const center = page.operation.x + page.operation.y * 10;
        PIECE_PATTERNS[page.operation.type][page.operation.rotation].forEach(gap => {
            page._field.field.pieces[center + gap] = typeNum;
        });
    }

    for (let y = 22; y >= 0; y--) {
        for (let x = 0; x < 10; x++) {
            const blockGraphics = new PIXI.Graphics();
            blockGraphics.beginFill(selectColor(page._field.field.pieces[x + 10 * (22 - y)]));
            blockGraphics.drawRect(0, 0, 17, 17);
            blockGraphics.endFill();
            blockGraphics.position.set(x * 17, y * 17);
            field.stage.addChild(blockGraphics);
        }
    }

    for (let x = 0; x < 10; x++) {
        const blockGraphics = new PIXI.Graphics();
        blockGraphics.beginFill(selectColor(page._field.garbage.pieces[x]));
        blockGraphics.drawRect(0, 0, 17, 17);
        blockGraphics.endFill();
        blockGraphics.position.set(x * 17, 391);
        field.stage.addChild(blockGraphics);
    }

    drawGrid(field, 17, 24, 10);

    const fumenComment = document.getElementById("fumenComment");
    fumenComment.textContent = page.comment || " ";
}

let currentPage = 0;
const moveToPageFunction = {};
function callDetail(index) {
    const popWindow = document.getElementById("popWindow");
    const detailWindow = document.getElementById("detailWindow");
    const elements = {
        detailIdTitle: document.getElementById("detailIdTitle"),
        detailAuthor: document.getElementById("detailAuthor"),
        detailRegisterDate: document.getElementById("detailRegisterDate"),
        detailFumenType: document.getElementById("detailFumenType"),
        detailTiming: document.getElementById("detailTiming"),
        detailComment: document.getElementById("detailComment"),
        detailField: document.getElementById("detailField"),
        detailClose: document.getElementById("detailClose")
    };

    popWindow.style.display = "block";

    const result = results[index];
    elements.detailIdTitle.textContent = `${result[0]}：${result[1]}`;
    elements.detailAuthor.textContent = `：${result[6]}`;
    elements.detailRegisterDate.textContent = `：${result[7].slice(0, 9)}`;
    elements.detailFumenType.textContent = `：${result[4]}`;
    elements.detailTiming.textContent = `：${result[5]}`;
    elements.detailComment.textContent = result[3] || "-";

    const fumenField = new PIXI.Application({
        width: 10 * 17,
        height: 24 * 17,
        backgroundColor: 0xffffff,
        resolution: 1,
        autoDensity: true
    });
    elements.detailField.appendChild(fumenField.view);

    currentPage = 0;

    const decoded = fumen.decoder.decode(result[2]);
    drawFumen(fumenField, decoded[currentPage]);

    function moveToInputPage() {
        if (fumenPageInput.value && fumenPageInput.value <= decoded.length && fumenPageInput.value > 0) {
            currentPage = fumenPageInput.value - 1;
            drawFumen(fumenField, decoded[currentPage]);
        }
    }
    function moveToPreviousPage() {
        if (currentPage > 0) {
            currentPage--;
            drawFumen(fumenField, decoded[currentPage]);
            fumenPageInput.value = currentPage + 1;
        }
    }
    function moveToNextPage() {
        if (currentPage < decoded.length - 1) {
            currentPage++;
            drawFumen(fumenField, decoded[currentPage]);
            fumenPageInput.value = currentPage + 1;
        }
    }


    moveToPageFunction.moveToInputPage = moveToInputPage;
    moveToPageFunction.moveToPreviousPage = moveToPreviousPage;
    moveToPageFunction.moveToNextPage = moveToNextPage;

    const fumenPageMax = document.getElementById("fumenPageMax");
    fumenPageMax.textContent = decoded.length;

    const fumenPageInput = document.getElementById("fumenPageInput");
    const previousPage = document.getElementById("previousPage");
    const nextPage = document.getElementById("nextPage");

    fumenPageInput.value = currentPage + 1;

    fumenPageInput.addEventListener("input", moveToInputPage);
    previousPage.addEventListener("click", moveToPreviousPage);
    nextPage.addEventListener("click", moveToNextPage);

    detailWindow.style.display = "block";
}

function changeStyle() {
    const main = document.getElementById("main");
    const result = document.getElementById("result");
    if (main.offsetWidth >= 1200) {
        main.style.flexDirection = "row";
        result.style.flexGrow = "0";
        result.style.marginLeft = "0";
        result.style.marginTop = "20px";
    } else {
        main.style.flexDirection = "column";
        result.style.flexGrow = "1";
        result.style.marginLeft = "80px";
        result.style.marginTop = "70px";
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetch('./sidebar/sidebar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('sidebar_contena').innerHTML = data;
            sidebarjs();
        });

    const field = new PIXI.Application({
        width: 10 * MINO_SCALE,
        height: 24 * MINO_SCALE,
        backgroundColor: 0xffffff,
        resolution: 1,
        autoDensity: true
    });
    document.getElementById("Field").appendChild(field.view);
    drawNull(field);
    field.stage.interactive = true;
    field.stage.on('pointerup', onDragEnd);
    field.stage.on('pointerupoutside', onDragEnd);

    const elements = {
        callUsersButton: document.getElementById("userTableButton"),
        userSelect: document.getElementById("userSelect"),
        popWindow: document.getElementById("popWindow"),
        popContent: document.getElementById("popWindow").children[0],
        popClose: document.getElementById("popClose"),
        detailWindow: document.getElementById("detailWindow"),
        detailClose: document.getElementById("detailWindow").querySelector(".detail-close"),
        fieldWidthInput: document.getElementById("FieldWidth"),
        fieldHeightInput: document.getElementById("FieldHeight"),
        fieldReset: document.getElementById("FieldReset"),
        fieldErase: document.getElementById("FieldErase"),
        clearButton: document.getElementById("clear"),
        searchButton: document.getElementById("search"),
        titleToggleSwitch: document.getElementById("TitleToggleSwitch"),
        mirrorToggleSwitch: document.getElementById("MirrorToggleSwitch"),
        fieldToggleSwitch: document.getElementById("FieldToggleSwitch")
    };

    elements.callUsersButton.addEventListener("click", callUsers);
    elements.userSelect.addEventListener("click", userInput);
    elements.popClose.addEventListener("click", () => {
        elements.popContent.style.display = "none";
        elements.popWindow.style.display = "none";
    });

    elements.detailClose.addEventListener("click", () => {
        fumenPageInput.removeEventListener("input", moveToPageFunction.moveToInputPage);
        previousPage.removeEventListener("click", moveToPageFunction.moveToPreviousPage);
        nextPage.removeEventListener("click", moveToPageFunction.moveToNextPage);
        document.getElementById("detailField").removeChild(document.getElementById("detailField").firstChild);
        elements.detailWindow.style.display = "none";
        elements.popWindow.style.display = "none";
    });
    elements.fieldHeightInput.addEventListener('input', () => generateField(field, MINO_SCALE));
    elements.fieldWidthInput.addEventListener('input', () => generateField(field, MINO_SCALE));
    elements.fieldReset.addEventListener("click", () => fieldReset(field));
    elements.fieldErase.addEventListener("click", () => fieldErase(field, MINO_SCALE));
    elements.clearButton.addEventListener("click", () => {
        document.querySelectorAll("input").forEach(input => { input.value = ""; });
        document.querySelectorAll("select").forEach(select => { select.selectedIndex = 0; });
        document.querySelectorAll(".toggle-switch").forEach(toggle => { toggle.classList.remove("active"); });
        fieldReset(field);
    });
    elements.searchButton.addEventListener("click", search);

    document.querySelectorAll(".group-button").forEach(button => {
        button.addEventListener("click", function () {
            const groupContent = this.nextElementSibling;
            this.classList.toggle("active");
            groupContent.style.display = this.classList.contains("active") ? "block" : "none";
        });
    });

    [elements.titleToggleSwitch, elements.mirrorToggleSwitch, elements.fieldToggleSwitch].forEach(toggle => {
        toggle.addEventListener("click", function () {
            this.classList.toggle("active");
        });
    });

    window.addEventListener('resize', changeStyle);
    changeStyle();
});

const LOADING_COLORS = ['#00fafa', '#f002f0', '#02d902', '#f00202', '#e89b02', '#0000ff', '#f7f70a'];

function changeBlockColors() {
    const blocks = document.querySelectorAll('.block');
    const color = LOADING_COLORS[Math.floor(Math.random() * LOADING_COLORS.length)];
    blocks.forEach(block => {
        block.style.backgroundColor = color;
    });
}

document.getElementById("loadingT").addEventListener("animationiteration", changeBlockColors);
changeBlockColors();