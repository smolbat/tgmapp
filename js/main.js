var noSleep = new NoSleep(); // необходим, чтобы телефон не "засыпал"

const PHONETICS = 1;
const TRANSCRIPTION = 2;
let phoneticType = PHONETICS;
// let songName = 'ENG000001';
// let songName = 'rooney';
let songName = 'FRA4';
// let songName = (new URL(window.location.href)).searchParams.get('tgWebAppStartParam');
let jsonSongDataPath = 'songs/titles/' + songName + '.json';
let songAudioPath = 'songs/' + songName + '.mp3';
let timeShiftArray = [];
let parsedSongData = [];
let selectedRow = -1;

// // Инициализация Телеграм
// Telegram.WebApp.ready();
// // Расширяем МиниАпп на весь экран
// Telegram.WebApp.expand();

// // Show main button
// Telegram.WebApp.MainButton.setParams({
//     text: 'Play'
// });
// Telegram.WebApp.MainButton.show();


let timeWhenAnimationStops = performance.now();

let audioPlayer = new Audio();
audioPlayer.src = songAudioPath;

(async () => { // обертка, так как внутри есть await функции
    // запрашиваем данные из внешнего файла
    let jsonResponse = await fetch(jsonSongDataPath);
    let songData = await jsonResponse.json();
    let result = parseSongData(songData);
    parsedSongData = result.words;
    timeShiftArray = result.timeshift;
    // рисуем субтитры
    drawSubtitles(parsedSongData, phoneticType);
    // и скролим их максимально вверх
    $('.songPage1').animate({ scrollTop: 0 }, 1000);
})();


//  Обработка нажатия кнопки Фонетика
$('#btnPhonetics').click(function() {
    if (phoneticType == PHONETICS) {
        phoneticType = TRANSCRIPTION;
        $('#btnPhonetics').text('Транскрипция');
    } else {
        phoneticType = PHONETICS;
        $('#btnPhonetics').text('Фонетика');
    }
    reDrawSubtitles(parsedSongData, phoneticType);
});


// Функция навигации по песне путем выбора строки песни
$('#mySongList').click(function(event) {
    let targetElement = event.target.closest('li');
    selectedRow = $(targetElement).index();
    // Если не добавить 0.001, то при выборе строки выделяется предыдущая,
    // так как время на мгновение меньше, чем надо чтобы выделилась текущая строка
    audioPlayer.currentTime = timeShiftArray[selectedRow][0] / 1000 + 0.001;
    selectRow(selectedRow);
});


////////////////////////////
//      Аудиомодуль
///////////////////////////
$('#btnPlay').click(function() {
    audioPlayer.paused ? audioPlayer.play() : audioPlayer.pause();
    $('#btnPlay').text(audioPlayer.paused ? "Play" : "Pause" );
});

// Telegram.WebApp.MainButton.onClick(function() {
//     if (audioPlayer.paused) {
//         Telegram.WebApp.MainButton.setParams({
//             text: 'Play'
//         });
//     } else {
//         Telegram.WebApp.MainButton.setParams({
//             text: 'Pause'
//         });        
//     }
//     audioPlayer.paused ? audioPlayer.play() : audioPlayer.pause();
// });


// функция, выделяющая строки во время проигрывания песни
audioPlayer.ontimeupdate = function() {
        let curTime = audioPlayer.currentTime;
        // $('#btnPlay').text(curTime + '   TIME = ' + timeShiftArray[selectedRow + 1][0] / 1000);
        selected = getSelectedRowAndWord(curTime);
        selectedRow = selected.currentRow;
        selectRow(selectedRow);
        selectWord(selected);
}

// при выходе со страницы или перезагрузке удаляем аудио объкт
// чтобы он не кешировался в браузере
//
// возможно функцию надо переработать!!!!
window.onbeforeunload = function() {
    noSleep.disable();
    audioPlayer = null;
    delete audioPlayer;
    return
}
