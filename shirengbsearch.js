const trace = console.log;
const input = document.getElementById('input');
const result = document.getElementById('result');
const searchbox = document.getElementById('searchbox');
const main = document.getElementById('main');
const topbutton = document.getElementById('topbutton');
const searchtip = document.getElementById('searchtip');
const itemResultList = [];
const ITEM_FOUND_COLOR = "#ffff88";
let resultDelayTimer = null;
let itemSearchNextIndex = 0;
let itemListAll = {};
let compositionStarted = false;
let searchLastString = null;
let autoscrollLastElement = null;

function checkTopButtonVisible()
{
    if (window.scrollY !== 0) {
        topbutton.style.display = 'block';
    }
    else if (topbutton.style.display !== 'none') {
        topbutton.style.display = 'none';
    }
}

function scrollEventWindow(e) {
    checkTopButtonVisible();
}

function goNextResult() {
    addFocusBoldFont(itemResultList[itemSearchNextIndex]);
    autoscroll(itemResultList[itemSearchNextIndex]);
    itemSearchNextIndex++;
    if (itemSearchNextIndex >= itemResultList.length) {
        itemSearchNextIndex = 0;
    }
}

function topButtonCenterPosition() {
    topbutton.style.left = (window.innerWidth / 2 - topbutton.clientWidth / 2) + "px";
}
function resizeEventWindow(e) {
    topButtonCenterPosition();
}

function keydownGlobal(e) {
    if (e.ctrlKey || e.shy || e.altKey) {
        return;
    }

    if (document.activeElement !== input) {
        // _resetResult();
        input.focus();
    }

    //esc
    if (e.keyCode === 27) {
        input.value = "";
        _resetResult();
        searchtip.style.display = 'block';
    }
    else if (itemResultList.length > 0) {
        if (e.keyCode === 9 || e.keyCode === 13) {
            if (itemResultList.length > 0) {
                goNextResult();
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

function pointerDownTopbutton(e) {
    window.scrollTo(0, 0);
}

function compositionstartInput(e) {
    compositionStarted = true;
}

function compositionendInput(e) {
    compositionStarted = false;
}

function inputEventInput(e) {
    window.scrollTo(0, 0);
    _search();
}

function _resetResult() {
    result.innerHTML = "";
    itemResultList.length = 0;
    itemSearchNextIndex = 0;
    resetTableFocusBG();
    removeFocusBoldFont();
}

function findTableParent(tdElement) {
    let parent = tdElement.parentNode;

    while (parent !== null && parent.tagName !== 'TABLE') {
        parent = parent.parentNode;
    }

    return parent;
}

function addFocusBoldFont(element) {
    removeFocusBoldFont();
    const par = element.parentElement;
    par.classList.add('itemfocusboldfont');
    autoscrollLastElement = par;
}

function removeFocusBoldFont() {
    if (autoscrollLastElement) {
        autoscrollLastElement.classList.remove('itemfocusboldfont');
    }
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

function clickEventItemlink(element) {
    const matches = element.id.match(/\d+/);
    if (matches) {
        const index = parseInt(matches[0], 10);

        addFocusBoldFont(itemResultList[index]);
        autoscroll(itemResultList[index]);
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
    const list = document.querySelectorAll('.itemname,.itemnamebuy,.itemnamesell,.monstername');

    for (const ele in list) {
        if (typeof (list[ele]) === "object" && list[ele].parentElement.hasAttribute('style')) {
            list[ele].parentElement.removeAttribute('style');
        }
    }
}

function searchItemPrice(price) {
    price = price + "";
    for (const type in itemListAll) {
        let tmpStr = "";

        for (item in itemListAll[type]) {
            if (itemListAll[type][item] === price) {
                tmpStr += item + "：" + price + "<br>";
            }
        }

        if (tmpStr !== "") {
            result.innerHTML += "<span class='itemfocusboldfont resultTableHeader" + ((type.indexOf("買取") >= 0) ? "2" : "1") + "'>" + type + "</span>" + "<br>" + tmpStr + "<p></p>";
        }
    }
}

function searchItemName(str) {
    str = wanakana.toKatakana(str);

    const items = {
        "アイテム": '.itemname:not(.itembuy,.itemsell)',
        "モンスター": '.monstername',
        "販売価格": '.itembuy',
        "買取価格": '.itemsell'
    }

    for (const key in items) {
        const list = document.querySelectorAll(items[key]);
        let tempstr = "";

        var regex = new RegExp(str);

        for (const ele in list) {
            if (typeof (list[ele]) === "object") {
                const innerText = wanakana.toKatakana(list[ele].innerText);
                if (regex.test(innerText)) {
                    tempstr += "<span class='itemlink' id='itemlink" + itemResultList.length + "' onclick='clickEventItemlink(this)'>"
                        + ((key === "モンスター") ? "［" + list[ele].previousElementSibling.innerText + "］" : "#")
                        + list[ele].innerText + "</span> ";
                    itemResultList.push(list[ele]);
                    focusTableBG(list[ele].parentElement);
                }
            }
        }

        if (tempstr !== "") {
            result.innerHTML += "<span class='resultTableHeader3'>" + key + "</span><br>" + tempstr + "<p></p>";
        }
    }
}

function _search() {
    if (compositionStarted === false) {
        _resetResult();
        clearTimeout(resultDelayTimer);
        resultDelayTimer = setTimeout(function () {
            let str = convertFullWidthNumberToString(input.value);
            searchLastString = str;

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

            if (result.innerHTML === "") {
                result.innerHTML = "<span class='resultTableHeader3'>(結果なし)</span>";
            }
        }, 200);
    }
}

function initItemList() {
    const typeArr1 = [0, "武器", "盾", "矢", "壺", "草・種", "杖", "巻物", "食料", "腕輪"];
    for (let i = 1; i <= 9; i++) {
        const obj1 = {};
        const obj2 = {};

        const list = document.querySelectorAll("#itemlist" + i + " .itemname");
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
        const list = document.querySelectorAll("#" + listArr[i] + " .itemname");

        for (const ele in list) {
            if (typeof (list[ele]) === "object") {
                const nextchild = list[ele].nextElementSibling;
                if (nextchild.getAttribute('colspan') !== null) {
                    obj[list[ele].innerText + "[ALL]"] = nextchild.innerText;
                }
                else {
                    let nextnextChild = list[ele].nextElementSibling;
                    for (let i = 1; i <= 10; i++) {
                        obj[list[ele].innerText + "[" + i + "]"] = nextnextChild.innerText;
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

window.onload = function (e) {
    topbutton.addEventListener('pointerdown', pointerDownTopbutton);
    input.addEventListener('input', inputEventInput);
    input.addEventListener('compositionstart', compositionstartInput);
    input.addEventListener('compositionend', compositionendInput);
    topbutton.addEventListener('pointerdown', pointerDownTopbutton);
    document.addEventListener('keydown', keydownGlobal);
    window.addEventListener('resize', resizeEventWindow);
    window.addEventListener('scroll', scrollEventWindow);

    //앵커 주소 표시 id가 주소로 바뀌는거 막기
    document.querySelectorAll('.scroll-link').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            // 기본 동작 막기
            e.preventDefault();
            // 앵커의 href 속성에서 섹션 ID 가져오기
            const targetId = this.getAttribute('href').substring(1);
            // 해당 섹션으로 스크롤
            document.getElementById(targetId).scrollIntoView(true);
        });
    });

    wanakana.bind(input, { IMEMode: false });
    topButtonCenterPosition();
    checkTopButtonVisible();
    initItemList();
    _search();
}
