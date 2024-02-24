const log = console.log;
const input = document.getElementById('search');
const result = document.getElementById('result');
const searchbox = document.getElementById('searchbox');
const main = document.getElementById('main');
const topbutton = document.getElementById('topbutton');
const itemLinkList = [];
let resultDelayTimer = null;
let itemLinkIndexCount = 0;
let itemLinkLastClicked = null;
let itemNextIndex = 0;
const ITEM_FOUND_COLOR = "#ffff88";
let itemlistArr = {};

function searchItemPrice(price) {
    price = price + "";
    for (const type in itemlistArr) {
        let tmpStr = "";

        for (item in itemlistArr[type]) {
            if (itemlistArr[type][item] === price) {
                tmpStr += "" + item + " : " + price + "<br>";
            }
        }

        if (tmpStr !== "") {
            result.innerHTML += "<span class='resultTableHeader" + ((type.indexOf("買取") >= 0) ? "2" : "1") + "'>" + type + "</span>" + "<br>" + tmpStr;
        }
        result.innerHTML += "<p></p>";
    }
}


function scrollEventWindow(e) {
    if (window.scrollY !== 0) {
        topbutton.style.display = 'block';
    }
    else if (topbutton.style.display = 'none') {
        topbutton.style.display = 'none';
    }
}

function focusEventInput(e) {
    if (result.innerHTML === "" && input.value !== "") {
        _search();
    }
}

function keydownGlobal(e) {
    if (e.ctrlKey || e.shy || e.altKey) {
        return;
    }

    if (document.activeElement !== input) {
        _resetResult();
        input.focus();
    }

    //esc
    if (e.keyCode === 27) {
        input.value = "";
        _resetResult();
    }
    else if (itemLinkList.length > 0) {
        if (e.keyCode === 9 || e.keyCode === 13) {
            autoscroll(itemLinkList[itemNextIndex]);
            // focusTableBGOnly(itemLinkList[itemNextIndex].parentElement);
            itemNextIndex++;
            if (itemNextIndex >= itemLinkList.length) {
                itemNextIndex = 0;
            }
            e.preventDefault();
        }
    }
}

function inputInfoVisible(visible) {
    const info = document.getElementById("searchinfo");
    info.style.display = (visible === false) ? 'none' : 'inline';
}

function convertFullWidthNumberToString(fullWidthString) {
    return fullWidthString.replace(/[０-９]/g, function (char) {
        const fullWidthCode = char.charCodeAt(0);
        const halfWidthCode = fullWidthCode - 0xFEE0;
        return String.fromCharCode(halfWidthCode);
    });
}

function pointerDownTopButton(e) {
    window.scrollTo(0, 0);
}

function inputEventInput(e) {
    window.scrollTo(0, 0);
    _search();
}

function _resetResult() {
    itemLinkLastClicked = null;
    result.innerHTML = "";
    itemLinkList.length = 0;
    itemNextIndex = 0;
    resetTableFocusBG();
}

function _search() {
    _resetResult();
    clearTimeout(resultDelayTimer);
    resultDelayTimer = setTimeout(function () {

        let str = convertFullWidthNumberToString(input.value);

        if (str === "") {
            inputInfoVisible(true);
            return;
        }

        inputInfoVisible(false);

        const numberOnly = /^\d+$/.test(str);
        if (numberOnly) {
            const price = parseInt(str);
            searchItemPrice(price);
        }
        else {
            itemLinkIndexCount = 0;
            searchItemName(str, 0); // item
            searchItemName(str, 1); // monster
        }
    }, 200);
}

function findTableParent(tdElement) {
    let parent = tdElement.parentNode;

    while (parent !== null && parent.tagName !== 'TABLE') {
        parent = parent.parentNode;
    }

    return parent;
}

function autoscroll(element) {
    const table = findTableParent(element);
    element.scrollIntoView(true);
    if (table) {
        window.scrollBy(0, -table.rows[0].clientHeight);
    }
    else {
        window.scrollBy(0, -36);
    }
}

function clickEventItemLink(element) {
    const matches = element.id.match(/\d+/);
    if (matches) {
        const index = parseInt(matches[0], 10);
        // focusTableBGOnly(itemLinkList[index].parentElement);
        autoscroll(itemLinkList[index]);
    }
}

function focusTableBGOnly(element) {
    resetTableFocusBG();
    focusTableBG(element);
}

function focusTableBG(element) {
    element.setAttribute('style', 'background-color:' + ITEM_FOUND_COLOR + ';');
    const lvtd = element.querySelector("td");
    if (lvtd.getAttribute('rowspan') !== null) {
        lvtd.setAttribute('style', 'background-color:#fff;');
    }
}

function resetTableFocusBG() {
    const list = document.querySelectorAll(".itemlist td[align='center'], #monsters td[align='center']");

    for (const ele in list) {
        if (typeof (list[ele]) === "object" && list[ele].parentElement.hasAttribute('style')) {
            list[ele].parentElement.removeAttribute('style');
        }
    }
}

function searchItemName(str, searchType) {
    const title = (searchType === 0) ? "アイテム" : "モンスター";
    const list = (searchType === 0) ? document.querySelectorAll('.itemlist td[align="center"]')
        : document.querySelectorAll('#monsters td[align="center"]')
    let tempstr = "";
    str = wanakana.toKatakana(str);

    var regex = new RegExp(str);

    for (const ele in list) {
        if (typeof (list[ele]) === "object") {
            const innerText = wanakana.toKatakana(list[ele].innerText);
            // if (innerText.substring(0, str.length) === str)
            // if (innerText.indexOf(str) >= 0)
            if (regex.test(innerText)) {
                tempstr += "<span class=itemlink id='itemLink" + itemLinkIndexCount + "' onclick='clickEventItemLink(this)'>#" + ((searchType === 1) ? "[" + list[ele].previousElementSibling.innerText + "]" : "") + list[ele].innerText + "</span> ";
                itemLinkList.push(list[ele]);
                itemLinkIndexCount++;
                focusTableBG(list[ele].parentElement);
            }
        }
    }

    if (itemLinkIndexCount === 1) {
        autoscroll(itemLinkList[itemLinkList.length - 1]);
    }
    else if (tempstr !== "") {
        result.innerHTML += "<span class='resultTableHeader'>" + title + "</span><br>" + tempstr + "<p></p>";
    }
}

function initItemList() {
    const typeArr1 = [0, "武器", "盾", "矢", "壺", "草・種", "杖", "巻物", "食料", "腕輪"];
    for (let i = 1; i <= 9; i++) {
        const list = document.querySelectorAll("#itemlist" + i + " " + "td[align='center']")
        const obj1 = {};
        const obj2 = {};

        for (const ele in list) {

            const key = list[ele].innerText;

            if (typeof (list[ele]) === "object") {
                if (list[ele].parentElement.children.length === 9) {
                    const nextchild1 = list[ele].nextElementSibling;
                    const nextchild2 = nextchild1.nextElementSibling;
                    const nextchild3 = nextchild2.nextElementSibling;

                    obj1[key] = nextchild2.innerText;
                    obj2[key] = nextchild3.innerText;
                }
                else {
                    const nextchild1 = list[ele].nextElementSibling;
                    const nextchild2 = nextchild1.nextElementSibling;

                    obj1[key] = nextchild1.innerText;
                    obj2[key] = nextchild2.innerText;
                }
            }
        }

        itemlistArr[typeArr1[i] + "(販売)"] = obj1;
        itemlistArr[typeArr1[i] + "(買取)"] = obj2;
    }

    const typeArr2 = ["杖(販売)", "杖(買取)", "壺(販売)", "壺(買取)"];
    const listArr = ["tue1", "tue2", "tubo1", "tubo2"];

    for (let i = 0; i < 4; i++) {
        const obj = {};
        const list = document.querySelectorAll("#" + listArr[i] + " td[align='center']");
        const itemtypestring = (i <= 2) ? "のつえ" : "のツボ";

        for (const ele in list) {
            if (typeof (list[ele]) === "object") {
                const nextchild = list[ele].nextElementSibling;
                if (nextchild.getAttribute('colspan') !== null) {
                    obj[list[ele].innerText + itemtypestring + "[ALL]"] = nextchild.innerText;
                }
                else {
                    let nextnextChild = list[ele].nextElementSibling;
                    for (let i = 1; i <= 10; i++) {
                        obj[list[ele].innerText + itemtypestring + "[" + i + "]"] = nextnextChild.innerText;
                        nextnextChild = nextnextChild.nextElementSibling;
                    }
                }
            }
        }

        if (typeArr2[i] in itemlistArr) {
            for (const key in obj) {
                itemlistArr[typeArr2[i]][key] = obj[key];
            }
        }
        else {
            itemlistArr[typeArr2[i]] = obj;
        }
    }
}

topbutton.addEventListener('pointerdown', pointerDownTopButton);
input.addEventListener('input', inputEventInput);
input.addEventListener('focus', focusEventInput);
document.addEventListener('keydown', keydownGlobal);
window.addEventListener('scroll', scrollEventWindow);
wanakana.bind(input, { IMEMode: false });
initItemList();
_search();