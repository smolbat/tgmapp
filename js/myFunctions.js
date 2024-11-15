// Фукция распарсивания json файла
function parseSongData(songData) {
    console.log("SongData - ", songData);
    let songArray = songData.words.map(function(elem) {
        return ({
            text: elem.text,
            start: elem.start,
        })
    });
    let text = songData.text.split(' ');
    let transcript = songData.transcript.split(' ');
    let ru_transcript = songData.ru_transcript.split(' ');
    let ru_translate = songData.ru_translate.split(' ');
    text = text.map(function(str) { return str.replace(/_/g, ' ') });
    transcript = transcript.map(function(str) { return str.replace(/_/g, ' ') });
    ru_transcript = ru_transcript.map(function(str) { return str.replace(/_/g, ' ') });
    ru_translate = ru_translate.map(function(str) { return str.replace(/_/g, ' ') });
    let resultArr = [];
    let timeShiftArr = [];
    let tsArr = [];
    let arr = [];
    for (i in songArray) {
        if (songArray[i].text.slice(-1) != '_') {
            arr.push([text[i], transcript[i], ru_transcript[i], ru_translate[i]]);
            tsArr.push(songArray[i].start);
        } else {
            arr.push([text[i], transcript[i], ru_transcript[i], ru_translate[i]]);
            resultArr.push(arr);
            arr = [];
            tsArr.push(songArray[i].start);
            timeShiftArr.push(tsArr);
            tsArr = [];
        }
    }
    let result = { words: resultArr, timeshift: timeShiftArr };
    return result;
}

// Функция рисования субтитров
function drawSubtitles(songData, phonetic) {
    let myHtmlElement = '<div>'+window.location+'</div>';
    songData.forEach(function(rowSong) {
        myHtmlElement += drawOneRowSubtitles(rowSong, phonetic);
    });
    // Рисуем то, что создали в HTML
    $('#mySongList').empty();
    $(myHtmlElement).appendTo('#mySongList');
}

// Функция получения HTML текста одной строки субтитров
function drawOneRowSubtitles(rowSong, phonetic) {
    let myHtmlElement = '<li class = "item-content"><div class = "item-inner"><table>';
    let text = '</tr>';
    let transcript = '</tr>';
    let ru_transcript = '</tr>';
    let ru_translate = '</tr>';
    for (element of rowSong) {
        text += '<td>' + element[0] + '</td>';
        transcript += '<td>' + element[1] + '</td>';
        ru_transcript += '<td>' + element[2] + '</td>';
        ru_translate += '<td>' + element[3] + '</td>';
    }
    text += '</tr>';
    transcript += '</tr>';
    ru_transcript += '</tr>';
    ru_translate += '</tr>';
    let middleElement = "";
    if (phonetic != 1) { middleElement = transcript; } else { middleElement = ru_transcript; }

    myHtmlElement += text + middleElement + ru_translate;
    myHtmlElement += '</table></div></li>';
    return myHtmlElement;
}

// Функция обновления субтитров для фонетики
function reDrawSubtitles(songData, phonetic) {
    for (i = 0; i < $('#mySongList li').length; ++i) {
        let innerHTML = '';
        let index = 1;
        if (phonetic != 1) { index = 1 } else { index = 2 };
        for (k in songData[i]) {
            innerHTML += '<td>' + songData[i][k][index] + '</td>';
        }
        $('#mySongList tbody:eq(' + i + ') > tr:eq(1)')[0].innerHTML = innerHTML;
    }
}

function getSelectedRowAndWord(currentTime) {
    let curRow;
    let curWordS;
    curRow = timeShiftArray.findLastIndex(tsArr => tsArr[0] <= currentTime * 1000);
    curWord = timeShiftArray[curRow].findLastIndex(arr => arr <= currentTime * 1000);
    return { currentRow: curRow, currentWord: curWord };
}

function selectRow(selectedRow) {
    // сбрасываем цвет всех выделеных слов
    // так как последнее слово в строке не сбрасывается после 
    // выделения следующей строки
    $('#mySongList td').css('color', '');
    // выставляем цвет выделенной строки
    $('#mySongList li').css('background', '');
    $('#mySongList li:eq(' + selectedRow + ')').css('background', 'silver');
    let now = performance.now();
    if (now > timeWhenAnimationStops) {
        scrollToCenter(selectedRow);
        timeWhenAnimationStops = now + 700;
    }
}

function selectWord(selected) {
    $('#mySongList tbody:eq(' + selected.currentRow + ') > tr:eq(1) > td').css('color', '');
    $('#mySongList tbody:eq(' + selected.currentRow + ') > tr:eq(1) > td:eq(' + selected.currentWord + ')').css('color', 'SteelBlue');
}

function scrollToCenter(selectedRow) {
    topShift = $('#mySongList')[0].offsetTop +
        selectedRow * $('#mySongList li')[0].offsetHeight -
        ($('.songPage1')[0].offsetHeight - $('#mySongList li')[0].offsetHeight) / 2;
    $('.songPage1').animate({ scrollTop: topShift }, 700);
}
