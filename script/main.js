document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
    }
});

const messages = [
"Нажимай где угодно",
"Эй, девочка с картинки ❤️",
"Я хочу тебе кое-что сказать",
"Попробуй нажать",
"Нажми еще раз",
"Давай, не сдавайся, нажимай",
"Обещаю, это последний раз",
"Серьезно",
"Это",
"Последний",
"Но это обман, хахаха, давай еще!",
"Я знаю, ты уже злишься",
"Хмм",
"Ладно тогда",
"А ведь",
"Я просто хотел сказать",
"С днем рождения!",
"Офигеть, я это сделал",
"Попробуй нажать кнопку внизу 💝"
];

let currentPage = 0;
let isLastPage = false;

function showMessage() {
    $('.message').text(messages[currentPage]);

    isLastPage = currentPage === messages.length - 1;

    if (isLastPage) {
        $('.next-button').show();
        $('.bg_heart').css('cursor', 'default');
    } else {
        $('.next-button').hide();
        $('.bg_heart').css('cursor', 'pointer');
    }
}

$('.bg_heart').on('click', function() {
    if (!isLastPage) {
        currentPage++;
        showMessage();
    }
});

var balloonColors = [
    "#ff4d6d", // красный
    "#ff9f1c", // оранжевый
    "#ffd93d", // жёлтый
    "#6bcb77", // зелёный
    "#4d96ff", // синий
    "#c77dff", // фиолетовый
    "#ff70a6", // розовый
    "#2ec4b6"  // бирюзовый
];

var love = setInterval(function() {
    var r_num = Math.floor(Math.random() * 40) + 1;
    var r_size = Math.floor(Math.random() * 65) + 10;
    var r_left = Math.floor(Math.random() * 100) + 1;
    var r_time = Math.floor(Math.random() * 5) + 5;
    var color1 = balloonColors[Math.floor(Math.random() * balloonColors.length)];
    var color2 = balloonColors[Math.floor(Math.random() * balloonColors.length)];

    $('.bg_heart').append("<div class='balloon' style='width:" + r_size + "px;height:" + Math.round(r_size * 1.2) + "px;left:" + r_left + "%;background:" + color1 + ";color:" + color1 + ";animation:love " + r_time + "s ease'></div>");

    $('.bg_heart').append("<div class='balloon' style='width:" + (r_size - 10) + "px;height:" + Math.round((r_size - 10) * 1.2) + "px;left:" + (r_left + r_num) + "%;background:" + color2 + ";color:" + color2 + ";animation:love " + (r_time + 5) + "s ease'></div>");

    $('.balloon').each(function() {
        var top = parseFloat($(this).css("top"));
        var width = parseFloat($(this).css("width"));
        if (top <= -100 || width >= 150) {
            $(this).remove();
        }
    });
}, 500);

showMessage();

function clearMusicState() {
    localStorage.removeItem('musicPlaying');
    localStorage.removeItem('musicCurrentTime');
}

window.onload = function() {
    clearMusicState();
}

function setupMusic() {
    const music = document.getElementById('backgroundMusic');

    if (!localStorage.getItem('initialLoad')) {
        clearMusicState();
        localStorage.setItem('initialLoad', 'true');
        music.currentTime = 0;
    }

    const isMusicPlaying = localStorage.getItem('musicPlaying') === 'true';
    const musicCurrentTime = localStorage.getItem('musicCurrentTime') || 0;

    if (isMusicPlaying) {
        music.currentTime = parseFloat(musicCurrentTime);
        music.play().catch(error => console.log('Playback failed', error));
    }

    music.addEventListener('play', () => {
        localStorage.setItem('musicPlaying', 'true');
    });

    music.addEventListener('pause', () => {
        localStorage.setItem('musicPlaying', 'false');
    });

    setInterval(() => {
        localStorage.setItem('musicCurrentTime', music.currentTime);
    }, 1000);

    document.addEventListener('click', function startMusic() {
        music.play().catch(error => {
            console.log('Autoplay prevented', error);
        });
        document.removeEventListener('click', startMusic);
    });
}

document.addEventListener('DOMContentLoaded', setupMusic);
