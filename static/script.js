document.addEventListener('DOMContentLoaded', function() {
    var urlInput = document.getElementById('urlInput');
    var shortenButton = document.getElementById('shortenBtn');
    var resultDiv = document.getElementById('result');
    var shortUrlInput = document.getElementById('shortUrl');
    var copyButton = document.getElementById('copyBtn');

    var generateQRBtn = document.getElementById('generateQRBtn');
    var qrCodeElement = document.getElementById('qrCode');

    // Функция проверки URL с помощью регулярного выражения
    function isValidUrl(string) {
        var regex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
        return regex.test(string);
    }

    // Функция для отправки POST-запроса на сокращение URL
    function shortenUrl(url) {
        // Проверяем, не пустой ли URL
        if (!url.trim()) {
            alert('Поле ввода не может быть пустым.');
            return;
        }
        
        if (!isValidUrl(url)) {
            alert('Данный текст не является URL адресом.');
            return;
        }
        
        // Добавляем префикс, если он отсутствует
        if (!/^(?:f|ht)tps?\:\/\//.test(url)) {
            url = 'http://' + url;
        }
        
        fetch('/shorten', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: url }),
        })
        .then(response => response.json())
        .then(data => {
            if(data.short_link) {
                showShortenedUrl(data.short_link);
            } else {
                alert('Произошла ошибка при сокращении ссылки.');
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('Произошла ошибка при сокращении ссылки.');
        });
    }


    generateQRBtn.addEventListener('click', function() {
        var url = shortUrlInput.value;
        if (url) {
            generateQRCode(url);
        }
    });

    // Функция для генерации QR-кода
// Функция для генерации QR-кода
    function generateQRCode(url) {
        qrCodeElement.innerHTML = ''; // Очистить предыдущий QR-код
        new QRCode(qrCodeElement, {
            text: url,
            width: 256,
            height: 256,
            colorDark: "#000000",
            colorLight: "#ffffff",
        });
        qrCodeElement.style.display = "block"; // Показать блок с QR-кодом
    }

    generateQRBtn.addEventListener('click', function() {
        var url = shortUrlInput.value;
        if (url) {
            generateQRCode(url);
        } else {
            alert('Сначала сократите ссылку, чтобы генерировать QR-код.');
        }
    });

    // Функция для отображения сокращенного URL
    function showShortenedUrl(shortUrl) {
        shortUrlInput.value = window.location.origin + '/' + shortUrl;
        resultDiv.style.display = 'block';
    }

    // Обработчик для кнопки "Сократить"
    shortenButton.addEventListener('click', function() {
        var originalUrl = urlInput.value;
        shortenUrl(originalUrl);
    });

    // Обработчик для кнопки "Копировать"
    copyButton.addEventListener('click', function() {
        shortUrlInput.select();
        document.execCommand('copy');
    });

    // Обработчик нажатия Enter в поле ввода
    urlInput.addEventListener('keyup', function(event) {
        if (event.keyCode === 13) { // Код клавиши Enter
            var originalUrl = urlInput.value;
            shortenUrl(originalUrl);
        }
    });
});
