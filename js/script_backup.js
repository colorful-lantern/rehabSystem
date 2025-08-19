// progressbar.js@1.0.0 version is used
// Docs: http://progressbarjs.readthedocs.org/en/1.0.0/

// comments
// 2025/06/25 update -- you can delete the rehabilitation record by URL parameter each0~3=false

// grobal variables
var numberOfClass = 0;
var nowClass = 0;

// Query parameters are saved to local storage as key-value pairs.
function saveQueryParamsToLocalStorage() {
    const params = new URLSearchParams(location.search);
    params.forEach((value, key) => localStorage.setItem(key, decodeURIComponent(value)));
}
saveQueryParamsToLocalStorage();

// URLパラメータのeach0-3=trueでリハビリデータを設定
(function handleEachParamsFromUrl() {
    const params = new URLSearchParams(location.search);
    
    for (let i = 0; i <= 3; i++) {
        const eachKey = `each${i}`;
        const paramValue = params.get(eachKey);
        
        if (paramValue === 'true') {
            // 対応するrehabilitationが有効な場合のみ設定
            const rehabKey = `rehabilitation${i + 1}`;
            if (localStorage.getItem(rehabKey) === 'true') {
                localStorage.setItem(eachKey, 'true');
            }
        } else if (paramValue === 'false') {
            // 削除処理
            const rehabKey = `rehabilitation${i + 1}`;
            if (localStorage.getItem(rehabKey) === 'true') {
                var rehabName = '';
                switch (i) {
                    case 0: rehabName = '理学療法'; break;
                    case 1: rehabName = '言語療法'; break;
                    case 2: rehabName = '作業療法'; break;
                    case 3: rehabName = '心理療法'; break;
                    default: rehabName = `未定義`;
                }
                alert(`${rehabName}の記録を削除します。`);
                localStorage.removeItem(eachKey);
            } else {
                alert('このリハビリの記録はありません。');
            }
        }
    }
})();

// 日付が変わった場合にlocalStorageの古いデータを削除する
(function clearOldDataOnNewDay() {
    const today = new Date().toISOString().split('T')[0];
    const lastAccessDate = localStorage.getItem('lastAccessDate');

    if (lastAccessDate !== today) {
        // 日付が変わった場合、each0~3を削除
        for (let i = 0; i <= 3; i++) {
            localStorage.removeItem(`each${i}`);
        }

        // 1年以上前のデータを削除
        const oneYearAgo = new Date();
        oneYearAgo.setDate(oneYearAgo.getDate() - 365);
        const oneYearAgoString = oneYearAgo.toISOString().split('T')[0];

        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('status_')) {
                const date = key.split('_')[1];
                if (date < oneYearAgoString) {
                    localStorage.removeItem(key);
                }
            }
        });

        localStorage.setItem('lastAccessDate', today);
    }
})();

// localstrageのkey(each0~3)のvalueがtrueである場合、cntを足して、その数を、localstrageのkey=nmboftrueに保存する
function saveTrueCountToLocalStorage() {
    let cnt = 0;
    let achievedStatus = [];
    for (let i = 0; i <= 3; i++) {
        let key = `each${i}`;
        const value = localStorage.getItem(key);
        const key2 = `rehabilitation${i + 1}`;
        const value2 = localStorage.getItem(key2);
        
        // 取り組むリハビリのみ記録
        if (value2 === 'true') {
            if (value === 'true') {
                cnt++;
                achievedStatus.push(`${key}=true`);
            } else if (value === 'false') {
                achievedStatus.push(`${key}=false`);
            }
            // valueがnullの場合は何も追加しない（自動生成しない）
        }
    }
    localStorage.setItem('nmboftrue', cnt);
    nowClass = cnt;

    // 日付ごとの達成状況を保存（データが存在する場合のみ）
    if (achievedStatus.length > 0) {
        const today = new Date().toISOString().split('T')[0];
        const totalRehabilitations = parseInt(localStorage.getItem('numberofClass') || 0);

        let statusValue = '';
        if (cnt === totalRehabilitations && totalRehabilitations > 0) {
            statusValue = 'clear';
        } else {
            statusValue = cnt.toString();
        }
        statusValue += ',' + achievedStatus.join(',');
        localStorage.setItem(`status_${today}`, statusValue);
    }
}
saveTrueCountToLocalStorage();

// localstrage のkey=rehabilitation1~4のvalueを取得して、設定を確認する
function loadCheckboxStates() {
    let cnt = 0;
    for (let i = 1; i <= 4; i++) {
        const key = `rehabilitation${i}`;
        const value = localStorage.getItem(key);
        if (value === 'true') {
            cnt++;
        }
    }
    if(cnt>0){
        numberOfClass = cnt;
        localStorage.setItem('numberofClass', numberOfClass);
    }else{
        if (!confirm('OKを押して、次の画面で設定を行います。\nはじめてではない方は、キャンセルを押してください。')) {
            alert('いつもと違うブラウザーでアクセスしている可能性があります。いつもと同じブラウザーでアクセスしてください。');
        }
        location.href = 'setting.html';
        return;
    }
}
loadCheckboxStates();

// clear local storage when URL contains ?clear=true
if (location.search.includes('clear=true')) {
    var result = confirm('すべてのデータを削除しますか？※削除するとデータを復元することはできません。\nOK: 削除する\nキャンセル: 削除しない');
    if(result == true){
        localStorage.clear();
    }
    if (location.search) {
        const url = location.href.split('?')[0];
        history.replaceState(null, null, url);
    }
    location.reload();  
};

// Display icons based on local storage values for each0 to each3
function displayIconsBasedOnLocalStorage() {
    for (let i = 0; i <= 3; i++) {
        let key = `each${i}`;
        const value = localStorage.getItem(key);
        const element = document.getElementById(`each${i}`);

        const key2 = `rehabilitation${i+1}`;
        const value2 = localStorage.getItem(key2);

        if (value === 'true') {
            if(value2 === 'false'){
                localStorage.setItem(key2, 'true');
            }
            const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            icon.setAttribute('class', 'bi bi-check-circle-fill');
            icon.setAttribute('fill', 'green');
            icon.setAttribute('viewBox', '0 0 16 16');
            icon.setAttribute('width', '36');
            icon.setAttribute('height', '36');
            icon.innerHTML = `
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM6.97 10.97a.75.75 0 0 0 1.07 0l3.992-3.992a.75.75 0 1 0-1.06-1.06L7.5 9.44 6.067 8.007a.75.75 0 1 0-1.06 1.06l1.963 1.963z"/>
            `;
            icon.style.color = 'green';
            element.appendChild(icon);

        }else if(value2 === 'false'){
            const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            icon.setAttribute('class', 'bi bi-dash');
            icon.setAttribute('fill', 'currentColor');
            icon.setAttribute('viewBox', '0 0 16 16');
            icon.setAttribute('width', '36');
            icon.setAttribute('height', '36');
            icon.innerHTML = `
                <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8"/>
            `;
            icon.style.color = 'gray';
            element.appendChild(icon);
        }else{
            const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            icon.setAttribute('class', 'bi bi-x-circle-fill');
            icon.setAttribute('fill', 'red');
            icon.setAttribute('viewBox', '0 0 16 16');
            icon.setAttribute('width', '36');
            icon.setAttribute('height', '36');
            icon.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
            </svg>
            `;
            icon.style.color = 'gray';
            element.appendChild(icon);
        }
    }
}
displayIconsBasedOnLocalStorage();

// 連続達成日数を計算する関数
function getConsecutiveClearDays() {
    let count = 0;
    let date = new Date();
    while (true) {
        const dateStr = date.toISOString().split('T')[0];
        const status = localStorage.getItem(`status_${dateStr}`);
        if (status && status.startsWith('clear')) {
            count++;
            date.setDate(date.getDate() - 1);
        } else {
            if (count === 0) return 0;
            break;
        }
    }
    return count;
}

// main progress bar
function createProgressBar(container, color, duration, fromColor, toColor, strokeWidth, trailWidth) {
    return new ProgressBar.Circle(container, {
        color: color,
        strokeWidth: strokeWidth,
        trailWidth: trailWidth,
        easing: 'easeInOut',
        duration: duration,
        text: {
            autoStyleContainer: false
        },
        from: { color: fromColor, width: strokeWidth },
        to: { color: toColor, width: strokeWidth },
        step: function(state, circle) {
            circle.path.setAttribute('stroke', state.color);
            circle.path.setAttribute('stroke-width', state.width);

            var value = Math.round(circle.value() * 100);
            var consecutiveDays = getConsecutiveClearDays();
            if (value === 0 || numberOfClass === 0) {
                circle.setText(
                    '<div style="font-size:1.5rem;">きょう</div>' +
                    '<div style="font-size:3rem;">0</div>' +
                    (consecutiveDays === 0
                        ? '<div style="border-top:1px solid #ccc; margin-top:6px; padding-top:4px; font-size:1.2rem;">あと' + '<b style="font-size:1.8rem;">' +　(numberOfClass - nowClass) +  '</b><div style="font-size:1.2rem; display:inline;">つ</div>'
                        : '<div style="border-top:1px solid #ccc; margin-top:6px; padding-top:4px; font-size:1rem;">' +
                            '<span style="font-size:1.8rem;font-weight:bold;">' + consecutiveDays + '</span>日連続達成中！</div>')
                );
            } else {
                circle.setText(
                    '<div style="font-size:1.5rem;">きょう</div>' +
                    '<div style="font-size:3rem; display:inline;">' + nowClass + '</div>' +
                    (consecutiveDays === 0
                        ? '<div style="border-top:1px solid #ccc; margin-top:6px; padding-top:4px; font-size:2rem;">' + '<div style="font-size:1.2rem;">あと' + '<b style="font-size:1.8rem;">'+ (numberOfClass - nowClass) + '</b><div style="font-size:1.2rem; display:inline;">つ</div>'
                        : '<div style="border-top:1px solid #ccc; margin-top:6px; padding-top:4px; font-size:1rem;">' +
                            '<span style="font-size:1.8rem;font-weight:bold;">' + consecutiveDays + '</span>日連続クリア</div>')
                );
            }
        }
    });
}

// main progress bar
var bar = createProgressBar(container, '#000000', 1400, '#4a9cbf', '#4a9cbf', 5, 6);
bar.text.style.fontSize = '3rem';
var animate = nowClass/numberOfClass;
if(animate >1) animate = 1;
bar.animate(animate);

saveTrueCountToLocalStorage();

// 各リハビリ療法の表示/非表示制御
function hideUnusedRehabilitation() {
    for (let i = 1; i <= 4; i++) {
        const key = `rehabilitation${i}`;
        const value = localStorage.getItem(key);
        const block = document.querySelector(`.rehab-block[data-rehab="${key}"]`);
        if (value !== 'true' && block) {
            block.style.display = 'none';
        }
    }
}
hideUnusedRehabilitation();
