const trace=console.log,input=document.getElementById("input"),result=document.getElementById("result"),searchbox=document.getElementById("searchbox"),main=document.getElementById("main"),topbutton=document.getElementById("topbutton"),searchtip=document.getElementById("searchtip"),itemResultList=[],ITEM_FOUND_COLOR="#ffff88";let itemSearchNextIndex=0,itemListAll={},searchLastString=null,autoscrollLastElement=null,resultHistory=[],inputSearchTimer=null;function checkTopButtonVisible(){0!==window.scrollY?topbutton.style.display="block":"none"!==topbutton.style.display&&(topbutton.style.display="none")}function scrollEventWindow(e){checkTopButtonVisible()}function goTopPage(){window.scrollTo(0,0),setTimeout(function(){input.focus(),input.setSelectionRange(0,input.value.length)},100)}function goNextResult(){itemSearchNextIndex>=itemResultList.length?(itemSearchNextIndex=0,goTopPage()):(addFocusBoldFont(itemResultList[itemSearchNextIndex]),autoscroll(itemResultList[itemSearchNextIndex]),itemSearchNextIndex++)}function keydownGlobal(e){e.ctrlKey||e.shiftKey||e.altKey||(27===e.keyCode?0!==window.scrollY?goTopPage():(input.value="",_resetResult(),document.activeElement!==input&&input.focus(),searchtip.style.display="block"):13===e.keyCode?(input.value!==searchLastString?_search():0<itemResultList.length&&goNextResult(),e.preventDefault()):9===e.keyCode&&(0<itemResultList.length&&0<itemResultList.length&&goNextResult(),e.preventDefault()),(48<=e.keyCode&&e.keyCode<=57||96<=e.keyCode&&e.keyCode<=105||65<=e.keyCode&&e.keyCode<=90||97<=e.keyCode&&e.keyCode<=122)&&document.activeElement!==input&&input.focus())}function convertFullWidthNumberToString(e){return e.replace(/[０-９]/g,function(e){e=e.charCodeAt(0);return String.fromCharCode(e-65248)})}function inputEventInput(e){clearTimeout(inputSearchTimer),inputSearchTimer=setTimeout(function(){""===input.value?(_resetResult(),searchtip.style.display="block"):_search()},100)}function pointerupEventInputok(e){input.value!==searchLastString&&_search()}function pointerDownTopbutton(e){goTopPage()}function _resetResult(){result.innerHTML="",itemResultList.length=0,itemSearchNextIndex=0,resetTableFocusBG(),removeFocusBoldFont()}function findTableParent(e){let t=e.parentNode;for(;null!==t&&"TABLE"!==t.tagName;)t=t.parentNode;return t}function addFocusBoldFont(e){removeFocusBoldFont();e=e.parentElement;e.classList.add("itemfocusboldfont"),autoscrollLastElement=e}function removeFocusBoldFont(){autoscrollLastElement&&autoscrollLastElement.classList.remove("itemfocusboldfont")}function autoscroll(e){e.scrollIntoView(!0),window.scrollBy(0,-document.documentElement.clientHeight/4)}function clickEventItemlink(e){var e=e.id.match(/\d+/);e&&(e=parseInt(e[0],10),addFocusBoldFont(itemResultList[e]),autoscroll(itemResultList[e]))}function focusTableBGOnly(e){resetTableFocusBG(),focusTableBG(e)}function focusTableBG(e){e.setAttribute("style","background-color:"+ITEM_FOUND_COLOR+";");e=e.querySelector("td");null!==e.getAttribute("rowspan")&&e.setAttribute("style","background-color:#fff;")}function resetTableFocusBG(){var e=document.querySelectorAll(".itemname,.itemnamebuy,.itemnamesell,.monstername");for(const t in e)"object"==typeof e[t]&&e[t].parentElement.hasAttribute("style")&&e[t].parentElement.removeAttribute("style")}function searchItemPrice(t){t+="";for(const n in itemListAll){let e="";for(item in itemListAll[n])itemListAll[n][item]===t&&(e+="<span class='resultTableHeader3'>"+item+"："+t+"</span><br>");""!==e&&(result.innerHTML+="<span class='itemfocusboldfont resultTableHeader"+(0<=n.indexOf("買取")?"2":"1")+"'>"+n+"</span><br>"+e+"<p></p>")}}function makeSearchRegExp(t){var n=t.length;let l="";for(let e=0;e<n;e++)l+=t[e]+".*";return l}function searchItemName(t){t=wanakana.toKatakana(t);var e={"アイテム":".itemname:not(.itembuy,.itemsell)","モンスター":".monstername","販売価格":".itembuy","買取価格":".itemsell"};const c="<span class='resultHighlight'>",m="</span>";var n=[];function l(t,n){var l=n.length;let o=-1;var r=[];for(let e=0;e<l;e++){var s=wanakana.toKatakana(t).indexOf(n[e],o+1);r.push(s),o=s}var e=function(t){var n=[];let l,i;for(let e=0;e<t.length;e++)0!==e&&t[e]===t[e-1]+1||(void 0!==l&&void 0!==i&&(l!==i?n.push([l,i]):n.push([l])),l=t[e]),i=t[e];return void 0!==l&&void 0!==i&&(l!==i?n.push([l,i]):n.push([l])),n}(r),a=e.length,u=t.split("");for(i=0;i<a;i++)1===e[i].length?u[e[i][0]]=c+u[e[i][0]]+m:(u[e[i][0]]=c+u[e[i][0]],u[e[i][1]]=u[e[i][1]]+m);return u.join("")}for(const h in e){var o,r,s=document.querySelectorAll(e[h]),a="モンスター"===h,u=new RegExp(makeSearchRegExp(t));for(const g in s)"object"==typeof s[g]&&(o=s[g].innerText,r=wanakana.toKatakana(o),u.test(r))&&(r=function(t,n){var l=n.length;let i=0;for(let e=0;e<l;e++){var o=t.indexOf(n[e],0);i+=o}return i}(r,t),n.push([r,o,s[g],a?"["+convertFullWidthNumberToString(s[g].previousElementSibling.innerText)+"]":"",h]))}n.sort((e,t)=>e[0]!==t[0]?e[0]-t[0]:e[1].length!==t[1].length?e[1].length-t[1].length:e[1].localeCompare(t[1]));let d="";var p=n.length;for(let e=0;e<p;e++){itemResultList.push(n[e][2]);var f=l(n[e][1],t);d+="<span class='resultTableHeader3'>["+n[e][4]+"] </span><span class='itemlink' id='itemlink"+e+"' onclick='clickEventItemlink(this)'>"+n[e][3]+f+"</span><br>",focusTableBG(n[e][2].parentElement)}result.innerHTML=d}function _search(){_resetResult();var e=convertFullWidthNumberToString(input.value);""===(searchLastString=e)?searchtip.style.display="block":(searchtip.style.display="none",/^\d+$/.test(e)?searchItemPrice(parseInt(e)):searchItemName(e),""===result.innerHTML&&(result.innerHTML="<span class='resultTableHeader3'>(結果なし)</span>"))}function initItemList(){var t=[0,"武器","盾","矢","壺","草・種","杖","巻物","食料","腕輪"];for(let e=1;e<=9;e++){var n={},l={},i=document.querySelectorAll("#itemlist"+e+" .itemname");for(const p in i){var o,r,s=i[p].innerText;"object"==typeof i[p]&&(9===i[p].parentElement.children.length?(r=(o=i[p].nextElementSibling.nextElementSibling).nextElementSibling,n[s]=o.innerText,l[s]=r.innerText):(r=(o=i[p].nextElementSibling).nextElementSibling,n[s]=o.innerText,l[s]=r.innerText))}itemListAll[t[e]+"(販売)"]=n,itemListAll[t[e]+"(買取)"]=l}var a=["杖(販売)","杖(買取)","壺(販売)","壺(買取)"],u=["tue1","tue2","tubo1","tubo2"];for(let e=0;e<4;e++){var c={},m=document.querySelectorAll("#"+u[e]+" .itemname");for(const f in m)if("object"==typeof m[f]){var d=m[f].nextElementSibling;if(null!==d.getAttribute("colspan"))c[m[f].innerText+"[ALL]"]=d.innerText;else{let t=m[f].nextElementSibling;for(let e=1;e<=10;e++)c[m[f].innerText+"["+e+"]"]=t.innerText,t=t.nextElementSibling}}if(a[e]in itemListAll)for(const h in c)itemListAll[a[e]][h]=c[h];else itemListAll[a[e]]=c}}window.onload=function(e){topbutton.addEventListener("pointerdown",pointerDownTopbutton),document.addEventListener("keydown",keydownGlobal),window.addEventListener("scroll",scrollEventWindow),document.getElementById("inputok").addEventListener("pointerup",pointerupEventInputok),input.addEventListener("input",inputEventInput),document.querySelectorAll(".scroll-link").forEach(e=>{e.addEventListener("click",function(e){e.preventDefault();e=this.getAttribute("href").substring(1);document.getElementById(e).scrollIntoView(!0)})}),wanakana.bind(input,{IMEMode:!1}),checkTopButtonVisible(),initItemList(),_search()};