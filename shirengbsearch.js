const trace = console.log;
const input = document.getElementById('search');
const result = document.getElementById('result');
const searchbox = document.getElementById('searchbox');
const main = document.getElementById('main');
const topbutton = document.getElementById('topbutton');
const searchtip = document.getElementById('searchtip');
const itemLinkList = [];
const ITEM_FOUND_COLOR = "#ffff88";
let resultDelayTimer = null;
let itemSearchNextIndex = 0;
let itemListAll = {};

function searchItemPrice(price) {
    price = price + "";
    for (const type in itemListAll) {
        let tmpStr = "";

        for (item in itemListAll[type]) {
            if (itemListAll[type][item] === price) {
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
            autoscroll(itemLinkList[itemSearchNextIndex]);
            itemSearchNextIndex++;
            if (itemSearchNextIndex >= itemLinkList.length) {
                itemSearchNextIndex = 0;
            }
            e.preventDefault();
        }
    }
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
    result.innerHTML = "";
    itemLinkList.length = 0;
    itemSearchNextIndex = 0;
    resetTableFocusBG();
}

function _search() {
    _resetResult();
    clearTimeout(resultDelayTimer);
    resultDelayTimer = setTimeout(function () {

        let str = convertFullWidthNumberToString(input.value);

        if (str === "") {
            searchtip.style.display = 'block';
            return;
        }
        searchtip.style.display = 'none';

        if (/^\d+$/.test(str)) {
            searchItemPrice(parseInt(str));
        }
        else {
            searchItemName(str);
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
    trace('autoscroll')
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

function searchItemName(str) {
    str = wanakana.toKatakana(str);

    const items = {
        "アイテム": '.itemlist td[align="center"]',
        "モンスター": '#monsters td[align="center"]'
    }

    for (const key in items) {
        const list = document.querySelectorAll(items[key]);
        let tempstr = "";

        var regex = new RegExp(str);

        for (const ele in list) {
            if (typeof (list[ele]) === "object") {
                const innerText = wanakana.toKatakana(list[ele].innerText);
                if (regex.test(innerText)) {
                    tempstr += "<span class=itemlink id='itemLink" + itemLinkList.length + "' onclick='clickEventItemLink(this)'>"
                    + ((key === "アイテム") ? "#" : "[" + list[ele].previousElementSibling.innerText + "]")
                    + list[ele].innerText + "</span> ";
                    itemLinkList.push(list[ele]);
                    focusTableBG(list[ele].parentElement);
                }
            }
        }

        if (tempstr !== "") {
            result.innerHTML += "<span class='resultTableHeader'>" + key + "：</span><br>" + tempstr + "<p></p>";
        }
    }

    if (itemLinkList.length === 1) {
        autoscroll(itemLinkList[itemLinkList.length - 1]);
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

        itemListAll[typeArr1[i] + "(販売)"] = obj1;
        itemListAll[typeArr1[i] + "(買取)"] = obj2;
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

        if (typeArr2[i] in itemListAll) {
            for (const key in obj) {
                itemListAll[typeArr2[i]][key] = obj[key];
            }
        }
        else {
            itemListAll[typeArr2[i]] = obj;
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