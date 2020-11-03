"use strict";
/*

    :: autoScrollToTag v 1.0.5 ::

Ищет все теги, у которых класс содержит TAG.
Блокирует стандартное действие ссылки. 
По клику делает плавный скрол.

Настройки:
itemTag - класс ссылки
duration - количество шагов, по умолчанию 100
speed - скорость скрола, по умолчанию 1000
ofset - отступ сверху
parentTag: родительский элемент, высота которого влияет на отступ при прокрутке
noParentOfsetLessWhen - значение, менее которого высота отступа родительского элемента не будет применяться

Подключение:

// плавный скрол к якорям 
let autoScrollToTag = require("./autoScrollToTag");

// плавный скрол к якорям
autoScrollToTag({
    itemTag: ".js-scroll",
    duration: "50", 
    speed: "1000",
    ofset: 30,
    parentTag: ".js-scroll-parent",
    noParentOfsetLessWhen: 1150
});


*/

module.exports = function (option) {

    let duration = option.durat || 100;
    let itemTag = option.itemTag || 'a[href^="#"]';
    let speed = option.speed || 1000;
    let ofset = option.ofset || 0;
    let parentTag = option.parentTag || undefined;
    let noParentOfsetLessWhen = option.noParentOfsetLessWhen || 0;
    let linkNodeList = document.querySelectorAll(itemTag); 
    var linkList = Array.prototype.slice.call(linkNodeList, 0);   

    linkList.forEach (function (a, i, arr) {

        let link = a.getAttribute("href");

        if (link == null || "") {
            console.error(a.outerHTML + " не ссылка"); 
            return;
        }

        if (!document.querySelector(link)) {
            console.error("битая ссылка на " + link); 
            return;
        }

        if  (link.length > 2) {

            let element = document.querySelector(link);

            // событие
            a.onclick = function (event) {
                event = event || window.event;
                // preventDefault +ie8
                event.preventDefault ? event.preventDefault() : (event.returnValue=false);

                // начальная прокрутка страницы
                let startPageYOffset = window.pageYOffset;

                // положение элемента на странице по Y
                function getCoords(elem) { // кроме IE8-
                    let box = elem.getBoundingClientRect();
                    return {
                        top: box.top + pageYOffset,
                        left: box.left + pageXOffset
                    };
                }

                let boxCoords = getCoords(element);
                let elemYOffset = boxCoords.top;

                let ofsetParent = 0;
                if (document.querySelector(parentTag) && (window.innerWidth > noParentOfsetLessWhen) ) {
                    ofsetParent = document.querySelector(parentTag).offsetHeight;   
                }
                
                // Действия:

                // получаем разницу
                let difference = elemYOffset - startPageYOffset - ofset - ofsetParent;

                // console.log("elemYOffset: " + elemYOffset);
                // console.log("startPageYOffset: " + startPageYOffset);
                // console.log("ofsetParent: " + ofsetParent);
                // console.log("ofset: " + ofset);
                // console.log("difference: " + difference); 
                // делим ее на интервалы
                let perTick = difference / duration;
                // задаем переменную для сохранения текущего положения прокрутки
                let currentPageYOffset = startPageYOffset;
                //  запускаем функцию
                scrollToUniversal(duration);

                // функция прокрутки (реккурсивная)
                function scrollToUniversal(duration) {

                    if (duration < 1) return;
                    
                    currentPageYOffset = currentPageYOffset + perTick;
                    window.scrollTo(0,currentPageYOffset);
                    // console.log(currentPageYOffset); 

                    setTimeout(function() {
                        scrollToUniversal(duration - 1);
                    }, (speed/difference) );
                }

            }
        }

    });

};


