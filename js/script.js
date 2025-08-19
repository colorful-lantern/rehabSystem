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
            const rehabKey = `rehabilitation${i + 1}`;
            const isRehabEnabled = localStorage.getItem(rehabKey) === 'true';
            
            if (isRehabEnabled) {
                // 対応するrehabilitationが有効な場合は設定
                localStorage.setItem(eachKey, 'true');
            } else {
                // 設定されていないリハビリの場合、モーダルで確認
                const rehabName = getRehabilitationName(i);
                showRehabilitationRegistrationModal(rehabName, rehabKey, eachKey);
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

// リハビリテーション名を取得するヘルパー関数
function getRehabilitationName(index) {
    switch (index) {
        case 0: return '理学療法';
        case 1: return '言語療法';
        case 2: return '作業療法';
        case 3: return '心理療法';
        default: return '未定義';
    }
}

// リハビリテーション登録確認モーダルを表示する関数
function showRehabilitationRegistrationModal(rehabName, rehabKey, eachKey) {
    // 既存のモーダルがあれば削除
    const existingModal = document.getElementById('rehabRegistrationModal');
    if (existingModal) {
        existingModal.remove();
    }

    // モーダルHTMLを作成
    const modalHTML = `
        <div class="modal fade" id="rehabRegistrationModal" tabindex="-1" aria-labelledby="rehabRegistrationModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="rehabRegistrationModalLabel">登録確認</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p><strong>${rehabName}</strong>は現在、取り組むリハビリとして設定されていません。</p>
                        <p>このリハビリを新しく登録して、今日の記録を追加しますか？</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">キャンセル</button>
                        <button type="button" class="btn btn-primary" id="confirmRegistration">登録して記録を追加</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // モーダルをページに追加
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // モーダルのイベントリスナーを設定
    const modal = document.getElementById('rehabRegistrationModal');
    const confirmBtn = document.getElementById('confirmRegistration');
    
    confirmBtn.addEventListener('click', function() {
        // リハビリテーションを有効化
        localStorage.setItem(rehabKey, 'true');
        localStorage.setItem(eachKey, 'true');
        
        // numberofClassを更新
        const currentNumberOfClass = parseInt(localStorage.getItem('numberofClass') || 0);
        localStorage.setItem('numberofClass', currentNumberOfClass + 1);
        
        // モーダルを閉じる
        const bootstrapModal = bootstrap.Modal.getInstance(modal) || new bootstrap.Modal(modal);
        bootstrapModal.hide();
        
        // ページをリロードして変更を反映
        setTimeout(() => {
            location.reload();
        }, 300);
    });

    // モーダルを表示
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();

    // モーダルが閉じられた後にDOM要素を削除
    modal.addEventListener('hidden.bs.modal', function() {
        modal.remove();
    });
}

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
    
    // URLパラメータでeach0-3=trueのアクセスがあったかチェック
    const params = new URLSearchParams(location.search);
    let hasEachTrueParam = false;
    for (let i = 0; i <= 3; i++) {
        if (params.get(`each${i}`) === 'true') {
            hasEachTrueParam = true;
            break;
        }
    }
    
    for (let i = 0; i <= 3; i++) {
        let key = `each${i}`;
        const value = localStorage.getItem(key);
        const key2 = `rehabilitation${i + 1}`;
        const value2 = localStorage.getItem(key2);
        
        // 取り組むリハビリのみ記録、each0-3=trueでアクセスされた場合のみ初期値設定を許可
        if (value2 === 'true') {
            if (value === 'true') {
                cnt++;
                achievedStatus.push(`${key}=true`);
            } else if (value === 'false') {
                achievedStatus.push(`${key}=false`);
            } else if (value === null && hasEachTrueParam) {
                // URLパラメータでeach0-3=trueでアクセスされた場合のみ初期値'false'を設定
                localStorage.setItem(key, 'false');
                achievedStatus.push(`${key}=false`);
            }
            // valueがnullでURLパラメータもない場合は何もしない（自動生成しない）
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

        // DOM要素が存在しない場合は処理をスキップ（calender.htmlなど）
        if (!element) {
            continue;
        }

        const key2 = `rehabilitation${i+1}`;
        const value2 = localStorage.getItem(key2);

        if (value === 'true') {
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
// function getConsecutiveClearDays() {
//     let count = 0;
//     let date = new Date();
//     while (true) {
//         const dateStr = date.toISOString().split('T')[0];
//         const status = localStorage.getItem(`status_${dateStr}`);
//         if (status && status.startsWith('clear')) {
//             count++;
//             date.setDate(date.getDate() - 1);
//         } else {
//             if (count === 0) return 0;
//             break;
//         }
//     }
//     return count;
// }

// 累計日数を取得する関数
function getTotalDaysCount() {
    let totalDays = 0;
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('status_')) {
            totalDays++;
        }
    });
    return totalDays;
}

// 節目メッセージ機能の定数と関数
const MILESTONE_DEFINITIONS = {
    weeks: [1, 2, 3, 4], // 週
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], // 月
    halfYear: [6], // 半年
    year: [1], // 1年
    yearlyAfterFirst: true // 1年後は毎年
};

// 初回記録日を取得する関数
function getFirstRecordDate() {
    let firstDate = null;
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('status_')) {
            const date = key.replace('status_', '');
            if (!firstDate || date < firstDate) {
                firstDate = date;
            }
        }
    });
    
    // デバッグログ
    console.log('初回記録日:', firstDate);
    
    return firstDate;
}

// 日付から経過期間を計算する関数
function calculateElapsedPeriod(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // 経過日数
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // 経過週数
    const weeks = Math.floor(diffDays / 7);
    
    // 経過月数（概算）
    const startYear = start.getFullYear();
    const startMonth = start.getMonth();
    const endYear = end.getFullYear();
    const endMonth = end.getMonth();
    
    let months = (endYear - startYear) * 12 + (endMonth - startMonth);
    
    // 日にちが開始日より前の場合は1月引く
    if (end.getDate() < start.getDate()) {
        months--;
    }
    
    // 経過年数
    let years = Math.floor(months / 12);
    
    return { days: diffDays, weeks, months, years };
}

// 節目かどうかを判定し、メッセージを生成する関数（2日間表示対応）
function checkAndGenerateMilestoneMessage() {
    const firstRecordDate = getFirstRecordDate();
    if (!firstRecordDate) {
        console.log('初回記録日が見つかりません');
        return null;
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    // 今日と昨日の両方をチェック（2日間表示のため）
    const todayDate = new Date(today);
    const yesterdayDate = new Date(todayDate);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split('T')[0];
    
    // 今日の経過期間を計算
    const elapsedToday = calculateElapsedPeriod(firstRecordDate, today);
    // 昨日の経過期間を計算
    const elapsedYesterday = calculateElapsedPeriod(firstRecordDate, yesterday);
    
    // デバッグログ
    console.log('節目メッセージ判定:', {
        firstRecordDate,
        today,
        yesterday,
        elapsedToday,
        elapsedYesterday
    });
    
    // 今日が節目の日かチェック
    const todayMessage = checkMilestoneForDate(firstRecordDate, today, elapsedToday);
    if (todayMessage) {
        return todayMessage;
    }
    
    // 昨日が節目の日だった場合もメッセージを表示
    const yesterdayMessage = checkMilestoneForDate(firstRecordDate, yesterday, elapsedYesterday);
    if (yesterdayMessage) {
        return yesterdayMessage;
    }
    
    return null;
}

// 指定した日付が節目かどうかを判定する関数
function checkMilestoneForDate(firstRecordDate, targetDate, elapsed) {
    // 節目の判定と優先順位（月単位での判定を優先）
    
    // 月の判定（1年以上でも毎月表示）
    const startDate = new Date(firstRecordDate);
    const targetDateObj = new Date(targetDate);
    
    // 毎月の同じ日かチェック
    const nMonthsLater = new Date(startDate);
    nMonthsLater.setMonth(nMonthsLater.getMonth() + elapsed.months);
    
    if (nMonthsLater.toISOString().split('T')[0] === targetDate && elapsed.months > 0) {
        // 1年以上の場合は「n年mか月」形式
        if (elapsed.years >= 1) {
            const remainingMonths = elapsed.months % 12;
            if (remainingMonths === 0) {
                // ちょうど年単位の場合
                return `リハビリをはじめて${elapsed.years}年がたちました`;
            } else {
                // 年と月を組み合わせた場合
                return `リハビリをはじめて${elapsed.years}年${remainingMonths}か月がたちました`;
            }
        } else {
            // 1年未満の場合
            if (elapsed.months === 6) {
                return 'リハビリをはじめて半年がたちました';
            } else if (MILESTONE_DEFINITIONS.months.includes(elapsed.months)) {
                return `リハビリをはじめて${elapsed.months}か月がたちました`;
            }
        }
    }
    
    // 週の判定
    if (MILESTONE_DEFINITIONS.weeks.includes(elapsed.weeks)) {
        // 正確にn週間後かチェック
        const startDate = new Date(firstRecordDate);
        const nWeeksLater = new Date(startDate);
        nWeeksLater.setDate(nWeeksLater.getDate() + (elapsed.weeks * 7));
        
        if (nWeeksLater.toISOString().split('T')[0] === targetDate) {
            return `リハビリをはじめて${elapsed.weeks}週間がたちました`;
        }
    }
    
    return null;
}

// 節目メッセージを表示する関数（2日間表示対応）
function displayMilestoneMessage() {
    const message = checkAndGenerateMilestoneMessage();
    const milestoneCard = document.getElementById('milestone-message');
    const messageText = document.getElementById('milestone-message-text');
    
    if (message && milestoneCard && messageText) {
        // メッセージテキストに改行を追加し、期間部分のフォントサイズを大きくする
        let formattedMessage = message.replace('リハビリをはじめて', 'リハビリをはじめて<br>');
        
        // 期間部分を青色マーカーで強調し、前後に間隔を追加
        const styleString = 'font-size: 1.6rem; font-weight: bold; background: linear-gradient(transparent 65%, rgba(13, 110, 253, 0.3) 65%, rgba(13, 110, 253, 0.3) 85%, transparent 85%); padding: 4px 12px; margin: 0 6px; border-radius: 6px 6px 0 0; color: #0d6efd; display: inline-block;';
        
        // 1. 年月組み合わせパターン（例：1年2か月）を最優先で処理
        formattedMessage = formattedMessage.replace(/(\d+年\d+か月)/g, `<span style="${styleString}">$1</span>`);
        // 2. 残りの単独パターンを処理（***MARKED***で一時的にマークして重複を防ぐ）
        formattedMessage = formattedMessage.replace(/(?<!<span[^>]*>)(\d+年)(?!\d)/g, `<span style="${styleString}">$1</span>***MARKED***`);
        formattedMessage = formattedMessage.replace(/(?<!年)(\d+か月)(?!<\/span>)/g, `<span style="${styleString}">$1</span>`);
        formattedMessage = formattedMessage.replace(/(\d+週間)/g, `<span style="${styleString}">$1</span>`);
        formattedMessage = formattedMessage.replace(/(半年)/g, `<span style="${styleString}">$1</span>`);
        // 3. マーカーを削除
        formattedMessage = formattedMessage.replace(/\*\*\*MARKED\*\*\*/g, '');
        
        messageText.innerHTML = formattedMessage;
        milestoneCard.style.display = 'block';
        
        // デバッグログ
        console.log('節目メッセージを表示:', message);
    } else if (milestoneCard) {
        milestoneCard.style.display = 'none';
        
        // デバッグログ
        if (!message) {
            console.log('今日は節目の日ではありません');
        }
    }
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
            var remainingTasks = numberOfClass - nowClass;
            var totalDays = getTotalDaysCount();
            
            // アニメーション用の変数を初期化（初回のみ）
            if (!circle.animationState) {
                circle.animationState = {
                    showingRemaining: true,
                    animationStarted: false
                };
            }
            
            if (value === 0 || numberOfClass === 0) {
                // 進捗(リハビリの数)が0の場合
                if (remainingTasks === 0) {
                    var bottomText = '<div style="font-size:1.3rem; color:#000000;">おめでとう</div>';
                } else {
                    var bottomText = '<div style="font-size:1.3rem; color:#000000;">はじめよう</div>'; // 「はじめよう」メッセージを追加
                }
                
                // メインテキストには0を表示
                circle.setText(
                    '<div style="height: 2rem; display: flex; align-items: center; justify-content: center; font-size:1.5rem;">きょう</div>' +
                    '<div style="height: 4rem; display: flex; align-items: center; justify-content: center; font-size:3rem;">0</div>' +
                    '<div style="height: 3rem; display: flex; align-items: center; justify-content: center;">' + (bottomText ? bottomText.replace('<div class="progress-bottom-text"', '<div class="progress-bottom-text" style="display: flex; align-items: center; justify-content: center;') : '') + '</div>'
                );
            } else {
                var bottomText;
                if (remainingTasks === 0) {
                    // すべて完了の場合、記録がある場合のみアニメーション
                    if (totalDays > 0) {
                        // アニメーション開始（初回のみ）
                        if (!circle.animationState.animationStarted) {
                            circle.animationState.animationStarted = true;
                            // アニメーション不要なので削除
                        }
                        
                        // おめでとうメッセージのみ表示
                        bottomText = '<div class="progress-bottom-text" style="font-size:1.3rem; color:#000000;">おめでとう</div>';
                    } else {
                        // 記録がない場合は「おめでとう」のみ
                        bottomText = '<div style="font-size:1.3rem; color:#000000;">おめでとう</div>';
                    }
                } else {
                    // アニメーション開始（初回のみ）
                    if (!circle.animationState.animationStarted) {
                        circle.animationState.animationStarted = true;
                        // アニメーション簡略化
                    }
                    
                    // あと○つのみ表示
                    bottomText = '<div class="progress-bottom-text" style="font-size:2rem;">' + '<div style="font-size:1.2rem;">あと' + '<b style="font-size:1.8rem;">' + remainingTasks + '</b><div style="font-size:1.2rem; display:inline;">つ</div></div>';
                }
                
                // メインテキストには現在の進捗を表示
                circle.setText(
                    '<div style="height: 2rem; display: flex; align-items: center; justify-content: center; font-size:1.5rem;">きょう</div>' +
                    '<div style="height: 4rem; display: flex; align-items: center; justify-content: center; font-size:3rem; display:inline;">' + nowClass + '</div>' +
                    '<div style="height: 3rem; display: flex; align-items: center; justify-content: center;">' + (bottomText ? bottomText.replace('<div class="progress-bottom-text"', '<div class="progress-bottom-text" style="display: flex; align-items: center; justify-content: center;') : '') + '</div>'
                );
            }
        }
    });
}

// 底部テキストのアニメーション制御（0個の場合）
function startBottomTextAnimationForZero(circle, totalDays) {
    setInterval(() => {
        // 現在の累計日数を再取得（リアルタイム更新のため）
        var currentTotalDays = getTotalDaysCount();
        
        // 状態を切り替え
        circle.animationState.showingRemaining = !circle.animationState.showingRemaining;
        
        // 底部テキスト要素のみにフェードアウト効果を適用
        const bottomTextElement = circle.text.querySelector('.progress-bottom-text');
        if (bottomTextElement) {
            bottomTextElement.style.transition = 'opacity 0.4s ease-in-out';
            bottomTextElement.style.opacity = '0';
        }
        
        setTimeout(() => {
            // テキストを更新
            var bottomText;
            if (circle.animationState.showingRemaining) {
                bottomText = '<div class="progress-bottom-text" style="font-size:2rem; opacity:0;">' + '<div style="font-size:1.2rem;">あなたのペースで</div></div>';
            } else {
                bottomText = '<div class="progress-bottom-text" style="font-size:2rem; opacity:0;">' + '<div style="font-size:1.2rem;">累計' + '<b style="font-size:1.8rem;">' + currentTotalDays + '</b><div style="font-size:1.2rem; display:inline;">日</div></div>';
            }
            
            circle.setText(
                '<div style="height: 2rem; display: flex; align-items: center; justify-content: center; font-size:1.5rem;">きょう</div>' +
                '<div style="height: 4rem; display: flex; align-items: center; justify-content: center; font-size:3rem;">0</div>' +
                '<div style="height: 3rem; display: flex; align-items: center; justify-content: center;">' + (bottomText ? bottomText.replace('<div class="progress-bottom-text"', '<div class="progress-bottom-text" style="display: flex; align-items: center; justify-content: center;') : '') + '</div>'
            );
            
            // 新しい底部テキスト要素にフェードイン効果を適用
            const newBottomTextElement = circle.text.querySelector('.progress-bottom-text');
            if (newBottomTextElement) {
                newBottomTextElement.style.transition = 'opacity 0.4s ease-in-out';
                // 少し遅らせてフェードイン開始
                setTimeout(() => {
                    newBottomTextElement.style.opacity = '1';
                }, 50);
            }
        }, 400); // フェードアウト完了後にテキスト変更
        
    }, 3000); // 3秒ごとに切り替え
}

// 底部テキストのアニメーション制御
function startBottomTextAnimation(circle, remainingTasks, totalDays) {
    // リハビリに1個も取り組んでいない場合はアニメーションしない
    if (nowClass === 0) {
        return;
    }
    
    setInterval(() => {
        // 現在の累計日数を再取得（リアルタイム更新のため）
        var currentTotalDays = getTotalDaysCount();
        var currentRemainingTasks = numberOfClass - nowClass;
        
        // 状態を切り替え
        circle.animationState.showingRemaining = !circle.animationState.showingRemaining;
        
        // 底部テキスト要素のみにフェードアウト効果を適用
        const bottomTextElement = circle.text.querySelector('.progress-bottom-text');
        if (bottomTextElement) {
            bottomTextElement.style.transition = 'opacity 0.4s ease-in-out';
            bottomTextElement.style.opacity = '0';
        }
        
        setTimeout(() => {
            // テキストを更新
            var bottomText;
            // あと○つのみ表示
            bottomText = '<div class="progress-bottom-text" style="font-size:2rem; opacity:0;">' + '<div style="font-size:1.2rem;">あと' + '<b style="font-size:1.8rem;">' + currentRemainingTasks + '</b><div style="font-size:1.2rem; display:inline;">つ</div></div>';
            
            circle.setText(
                '<div style="height: 2rem; display: flex; align-items: center; justify-content: center; font-size:1.5rem;">きょう</div>' +
                '<div style="height: 4rem; display: flex; align-items: center; justify-content: center; font-size:3rem; display:inline;">' + nowClass + '</div>' +
                '<div style="height: 3rem; display: flex; align-items: center; justify-content: center;">' + (bottomText ? bottomText.replace('<div class="progress-bottom-text"', '<div class="progress-bottom-text" style="display: flex; align-items: center; justify-content: center;') : '') + '</div>'
            );
            
            // 新しい底部テキスト要素にフェードイン効果を適用
            const newBottomTextElement = circle.text.querySelector('.progress-bottom-text');
            if (newBottomTextElement) {
                newBottomTextElement.style.transition = 'opacity 0.4s ease-in-out';
                // 少し遅らせてフェードイン開始
                setTimeout(() => {
                    newBottomTextElement.style.opacity = '1';
                }, 50);
            }
        }, 400); // フェードアウト完了後にテキスト変更
        
    }, 3000); // 3秒ごとに切り替え
}

// 完了時の底部テキストのアニメーション制御
function startBottomTextAnimationForComplete(circle, totalDays) {
    // リハビリに1個も取り組んでいない場合はアニメーションしない
    if (nowClass === 0) {
        return;
    }
    
    setInterval(() => {
        // 現在の累計日数を再取得（リアルタイム更新のため）
        var currentTotalDays = getTotalDaysCount();
        
        // 状態を切り替え
        circle.animationState.showingRemaining = !circle.animationState.showingRemaining;
        
        // 底部テキスト要素のみにフェードアウト効果を適用
        const bottomTextElement = circle.text.querySelector('.progress-bottom-text');
        if (bottomTextElement) {
            bottomTextElement.style.transition = 'opacity 0.4s ease-in-out';
            bottomTextElement.style.opacity = '0';
        }
        
        setTimeout(() => {
            // テキストを更新
            var bottomText;
            // おめでとうメッセージのみ表示
            bottomText = '<div class="progress-bottom-text" style="font-size:1.3rem; opacity:0; color:#000000;">おめでとう</div>';
            
            circle.setText(
                '<div style="height: 2rem; display: flex; align-items: center; justify-content: center; font-size:1.5rem;">きょう</div>' +
                '<div style="height: 4rem; display: flex; align-items: center; justify-content: center; font-size:3rem; display:inline;">' + nowClass + '</div>' +
                '<div style="height: 3rem; display: flex; align-items: center; justify-content: center;">' + (bottomText ? bottomText.replace('<div class="progress-bottom-text"', '<div class="progress-bottom-text" style="display: flex; align-items: center; justify-content: center;') : '') + '</div>'
            );
            
            // 新しい底部テキスト要素にフェードイン効果を適用
            const newBottomTextElement = circle.text.querySelector('.progress-bottom-text');
            if (newBottomTextElement) {
                newBottomTextElement.style.transition = 'opacity 0.4s ease-in-out';
                // 少し遅らせてフェードイン開始
                setTimeout(() => {
                    newBottomTextElement.style.opacity = '1';
                }, 50);
            }
        }, 400); // フェードアウト完了後にテキスト変更
        
    }, 3000); // 3秒ごとに切り替え
}

// main progress bar
const totalRehab = calculateAndSaveTotalRehab();
const currentRank = getCurrentRank(totalRehab);
const rankColor = getRankColor(currentRank);

// containerが存在する場合のみプログレスバーを作成（index.html用）
const container = document.getElementById('container');
if (container) {
    var bar = createProgressBar(container, '#000000', 1400, rankColor, rankColor, 5, 6);
    bar.text.style.fontSize = '3rem';
    var animate = nowClass/numberOfClass;
    if(animate >1) animate = 1;
    bar.animate(animate);
}

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

// プログレステキストアニメーション関数群（先に定義）
let progressTextAnimationInterval = null;
let progressTextAnimationState = 0; // 0: 次のランクまで, 1: 合計ポイント

function startProgressTextAnimation(totalRehab, currentRank, rankProgress) {
    const progressText = document.querySelector('#rankstatus .d-flex.align-baseline.justify-content-end');
    if (!progressText) return;
    
    // 既存のアニメーションがあれば停止
    stopProgressTextAnimation();
    
    // 初期表示
    updateProgressTextDisplay(totalRehab, currentRank, rankProgress, progressText);
    
    // 3秒ごとにアニメーション
    progressTextAnimationInterval = setInterval(() => {
        // フェードアウト
        progressText.style.opacity = '0';
        
        setTimeout(() => {
            // 状態を次に進める（0 → 1 → 0...）
            progressTextAnimationState = (progressTextAnimationState + 1) % 2;
            
            // 新しいコンテンツに更新
            updateProgressTextDisplay(totalRehab, currentRank, rankProgress, progressText);
            
            // フェードイン
            progressText.style.opacity = '1';
        }, 400); // フェードアウト完了後
    }, 3000);
}

function updateProgressTextDisplay(totalRehab, currentRank, rankProgress, progressText) {
    const remaining = rankProgress.required - rankProgress.current;
    const nextRank = getNextRank(currentRank);
    const nextRankColor = getRankColor(nextRank);
    
    let content = '';
    
    switch(progressTextAnimationState) {
        case 0: // 次のランクまでの残りポイント
            content = `<span style="display: inline-flex; align-items: baseline;"><span class="badge rounded-pill text-white" style="background-color: ${nextRankColor}; font-size: 1.1rem; margin: 0 4px;">${nextRank}</span>ランクまで<span style="font-size: 1.5rem; font-weight: bold; color: ${nextRankColor}; margin: 0 2px;">${remaining}</span>ポイント</span>`;
            break;
        case 1: // 合計ポイント
            content = `<span style="display: inline-flex; align-items: baseline;">合計<span style="font-size: 1.5rem; font-weight: bold; color: ${nextRankColor}; margin: 0 2px;">${totalRehab}</span>ポイント</span>`;
            break;
    }
    
    progressText.innerHTML = content;
}

// プラチナランク専用のアニメーション関数
function startProgressTextAnimationForPlatinum(totalRehab, progressText) {
    const platinumColor = getRankColor('プラチナ');
    
    // 既存のアニメーションがあれば停止
    stopProgressTextAnimation();
    
    // 初期表示（最高ランクに到達！）
    updatePlatinumProgressTextDisplay(totalRehab, progressText, platinumColor);
    
    // 3秒ごとにアニメーション
    progressTextAnimationInterval = setInterval(() => {
        // フェードアウト
        progressText.style.opacity = '0';
        
        setTimeout(() => {
            // 状態を次に進める（0 → 1 → 0...）
            progressTextAnimationState = (progressTextAnimationState + 1) % 2;
            
            // 新しいコンテンツに更新
            updatePlatinumProgressTextDisplay(totalRehab, progressText, platinumColor);
            
            // フェードイン
            progressText.style.opacity = '1';
        }, 400); // フェードアウト完了後
    }, 3000);
}

function updatePlatinumProgressTextDisplay(totalRehab, progressText, platinumColor) {
    let content = '';
    
    switch(progressTextAnimationState) {
        case 0: // 最高ランクに到達！
            content = `<span style="display: inline-flex; align-items: baseline; color: ${platinumColor}; font-weight: bold;">最高ランクに到達！</span>`;
            break;
        case 1: // 合計ポイント
            content = `<span style="display: inline-flex; align-items: baseline;">合計<span style="font-size: 1.5rem; font-weight: bold; color: ${platinumColor}; margin: 0 2px;">${totalRehab}</span>ポイント</span>`;
            break;
    }
    
    progressText.innerHTML = content;
}

function stopProgressTextAnimation() {
    if (progressTextAnimationInterval) {
        clearInterval(progressTextAnimationInterval);
        progressTextAnimationInterval = null;
    }
    progressTextAnimationState = 0; // 状態をリセット
}

// ランク表示を更新（ランクアップ検出含む）
checkAndAnimateStageUp();

// 節目メッセージを表示
displayMilestoneMessage();

// ランク制度関連の関数群

// totalrehabを計算してlocalStorageに保存
function calculateAndSaveTotalRehab() {
    let totalRehab = 0;
    
    // すべてのstatus_キーを検索して合計を計算
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('status_')) {
            const statusValue = localStorage.getItem(key);
            if (statusValue) {
                // status値の最初の部分（数字またはclear）を取得
                const parts = statusValue.split(',');
                const countPart = parts[0];
                
                if (countPart === 'clear') {
                    // clearの場合、その日のnumberofClassを加算
                    // 過去のデータなので、eachの数をカウント
                    const eachCount = parts.filter(part => part.includes('=true')).length;
                    totalRehab += eachCount;
                } else {
                    // 数字の場合はそのまま加算
                    const count = parseInt(countPart);
                    if (!isNaN(count)) {
                        totalRehab += count;
                    }
                }
            }
        }
    });
    
    localStorage.setItem('totalrehab', totalRehab);
    return totalRehab;
}

// 現在のランクを計算
function getCurrentRank(totalRehab) {
    if (totalRehab < 10) return 'ビギナー';
    if (totalRehab < 30) return 'ブロンズ';
    if (totalRehab < 60) return 'シルバー';
    if (totalRehab < 100) return 'ゴールド';
    return 'プラチナ';
}

// ランク内の進捗を計算
function getRankProgress(totalRehab) {
    if (totalRehab < 10) return { current: totalRehab, required: 10 };
    if (totalRehab < 30) return { current: totalRehab - 10, required: 20 };
    if (totalRehab < 60) return { current: totalRehab - 30, required: 30 };
    if (totalRehab < 100) return { current: totalRehab - 60, required: 40 };
    return { current: 0, required: 0 }; // プラチナは最高レベル
}

// 次のランクを取得
function getNextRank(currentRank) {
    switch (currentRank) {
        case 'ビギナー': return 'ブロンズ';
        case 'ブロンズ': return 'シルバー';
        case 'シルバー': return 'ゴールド';
        case 'ゴールド': return 'プラチナ';
        case 'プラチナ': return null; // プラチナは最高レベル
        default: return 'ブロンズ';
    }
}

// ランクに応じた色を取得
function getRankColor(rank) {
    switch (rank) {
        case 'ビギナー': return '#495057'; // 濃いグレー（見やすく改善）
        case 'ブロンズ': return '#b8860b'; // 濃いブロンズ色（見やすく改善）
        case 'シルバー': return '#708090'; // 濃いシルバー色（見やすく改善）
        case 'ゴールド': return '#daa520'; // 濃いゴールド色（見やすく改善）
        case 'プラチナ': return '#4a4a4a'; // 濃いプラチナ色（見やすく改善）
        default: return '#495057';
    }
}

// ランク情報を更新
function updateRankDisplay() {
    const totalRehab = calculateAndSaveTotalRehab();
    const currentRank = getCurrentRank(totalRehab);
    const rankProgress = getRankProgress(totalRehab);
    const rankColor = getRankColor(currentRank);
    
    // ランクバッジを更新
    const rankBadge = document.querySelector('#rankstatus .badge');
    if (rankBadge) {
        rankBadge.textContent = currentRank;
        rankBadge.style.backgroundColor = rankColor;
        // すべてのランクで白文字を使用（視認性向上）
        rankBadge.style.color = '#fff';
        rankBadge.classList.remove('bg-primary');
    }
    
    // プログレスバーを更新
    const progressBar = document.querySelector('#rankstatus .progress-bar');
    if (progressBar) {
        if (currentRank === 'プラチナ') {
            // プラチナの場合は100%で固定
            progressBar.style.width = '100%';
        } else {
            const progressPercentage = (rankProgress.current / rankProgress.required) * 100;
            progressBar.style.width = `${progressPercentage}%`;
        }
        progressBar.style.backgroundColor = rankColor;
        progressBar.classList.remove('bg-primary');
    }
    
    // 進捗テキストを更新（アニメーション機能付き）
    const progressText = document.querySelector('#rankstatus .d-flex.align-baseline.justify-content-end');
    if (progressText) {
        if (currentRank === 'プラチナ') {
            // プラチナランクの場合も専用のアニメーションを開始
            startProgressTextAnimationForPlatinum(totalRehab, progressText);
        } else {
            // アニメーション開始
            startProgressTextAnimation(totalRehab, currentRank, rankProgress);
        }
    }
    
    // index.html用のランク情報表示も更新
    if (typeof updateIndexRankDisplay === 'function') {
        updateIndexRankDisplay();
    }
}

// ステージアップ演出関連の関数群

// ステージアップ演出関連の関数群

// ランクアップを検出してアニメーションを実行
function checkAndAnimateStageUp() {
    const totalRehab = calculateAndSaveTotalRehab();
    const currentRank = getCurrentRank(totalRehab);
    const lastRank = localStorage.getItem('lastRank') || 'ビギナー';
    
    // 初回アクセス時はlastRankを現在のランクに設定
    if (!localStorage.getItem('lastRank')) {
        localStorage.setItem('lastRank', currentRank);
        updateRankDisplay();
        return;
    }
    
    // ランクアップが発生した場合
    if (getRankLevel(currentRank) > getRankLevel(lastRank)) {
        // 旧ランクの色を事前に取得して保持
        const oldRankColor = getRankColor(lastRank);
        triggerRankUpAnimation(currentRank, oldRankColor);
        localStorage.setItem('lastRank', currentRank);
    } else {
        // 通常のランク表示更新
        updateRankDisplay();
    }
}

// ランクレベルを数値で取得（比較用）
function getRankLevel(rank) {
    switch (rank) {
        case 'ビギナー': return 1;
        case 'ブロンズ': return 2;
        case 'シルバー': return 3;
        case 'ゴールド': return 4;
        case 'プラチナ': return 5;
        default: return 0;
    }
}

// ランクアップアニメーションを実行
function triggerRankUpAnimation(newRank, oldRankColor) {
    const rankColor = getRankColor(newRank);
    
    // 1. RANK UP! テキストを表示
    showRankUpText(newRank, oldRankColor);
    
    // 2. プログレスバーのリセットアニメーション
    animateProgressBarReset(rankColor, oldRankColor);
    
    // 3. ランクバッジの色変化アニメーション
    animateRankBadgeChange(newRank, rankColor);
}

// RANK UP! テキストを表示（ランクバッジ部分に）
function showRankUpText(newRank, oldRankColor) {
    const rankBadge = document.querySelector('#rankstatus .badge');
    if (!rankBadge) return;
    
    // 元のバッジ内容を保存
    const originalContent = rankBadge.innerHTML;
    const originalColor = rankBadge.style.backgroundColor;
    
    // CSSアニメーションを追加
    if (!document.getElementById('rankUpAnimationStyle')) {
        const style = document.createElement('style');
        style.id = 'rankUpAnimationStyle';
        style.textContent = `
            @keyframes rankUpPulse {
                0% { transform: scale(1); }
                25% { transform: scale(1.3); }
                50% { transform: scale(1.1); }
                75% { transform: scale(1.2); }
                100% { transform: scale(1); }
            }
            
            @keyframes progressReset {
                0% { width: 100%; }
                50% { width: 100%; background-color: #FFD700; }
                100% { width: 0%; }
            }
            
            @keyframes badgeGlow {
                0% { box-shadow: 0 0 5px rgba(255, 215, 0, 0.5); }
                50% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.8); }
                100% { box-shadow: 0 0 5px rgba(255, 215, 0, 0.5); }
            }
            
            @keyframes textColorFlash {
                0% { color: #FFD700; }
                50% { color: #FFF; }
                100% { color: #FFD700; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // ランクアップテキストに変更（背景色は旧ランクの色を使用）
    rankBadge.innerHTML = `<span style="font-size: 1rem; animation: textColorFlash 0.5s ease-in-out 4;">ランクアップ!</span>`;
    rankBadge.style.backgroundColor = oldRankColor; // 旧ランクの色を使用
    rankBadge.style.animation = 'rankUpPulse 2s ease-in-out';
    
    // 2秒後に新しいランク表示に変更
    setTimeout(() => {
        rankBadge.textContent = newRank;
        rankBadge.style.backgroundColor = getRankColor(newRank);
        // すべてのランクで白文字を使用（視認性向上）
        rankBadge.style.color = '#fff';
        rankBadge.style.animation = '';
    }, 2000);
}

// プログレスバーのリセットアニメーション
function animateProgressBarReset(newColor, oldRankColor) {
    const progressBar = document.querySelector('#rankstatus .progress-bar');
    const progressText = document.querySelector('#rankstatus .d-flex.align-baseline.justify-content-end');
    
    if (progressBar) {
        // 現在の旧ランクの色を保持
        progressBar.style.backgroundColor = oldRankColor;
        
        // CSSアニメーションを追加（旧ランク色ベースのリセットアニメーション）
        if (!document.getElementById('progressResetStyle')) {
            const style = document.createElement('style');
            style.id = 'progressResetStyle';
            style.textContent = `
                @keyframes progressResetFromOld {
                    0% { width: 100%; }
                    50% { width: 100%; background-color: #FFD700; }
                    100% { width: 0%; }
                }
            `;
            document.head.appendChild(style);
        }
        
        // リセットアニメーションを適用
        progressBar.style.animation = 'progressResetFromOld 1.5s ease-in-out';
        
        // 進捗テキストも即座に「次の〇〇ランクまであと0ポイント」に変更
        if (progressText) {
            const totalRehab = calculateAndSaveTotalRehab();
            const currentRank = getCurrentRank(totalRehab);
            const nextRank = getNextRank(currentRank);
            if (nextRank) {
                const nextRankColor = getRankColor(nextRank);
                progressText.innerHTML = `<span style="display: inline-flex; align-items: baseline;"><span class="badge rounded-pill text-white" style="background-color: ${nextRankColor}; font-size: 1.1rem; margin: 0 4px;">${nextRank}</span>ランクまで<span style="font-size: 1.5rem; font-weight: bold; color: ${nextRankColor}; margin: 0 2px;">0</span>ポイント</span>`;
            } else {
                // プラチナランクの場合は「最高ランクに到達！」を表示
                const platinumColor = getRankColor('プラチナ');
                progressText.innerHTML = `<span style="display: inline-flex; align-items: baseline; color: ${platinumColor}; font-weight: bold;">最高ランクに到達！</span>`;
            }
        }
        
        // アニメーション完了後に新しい状態に更新
        setTimeout(() => {
            progressBar.style.animation = '';
            updateRankDisplay(); // 通常の表示に戻す
        }, 1500);
    }
}

// ランクバッジの色変化アニメーション
function animateRankBadgeChange(newRank, newColor) {
    // showRankUpText内でバッジの更新も行うため、ここでは追加のグロー効果のみ適用
    const rankBadge = document.querySelector('#rankstatus .badge');
    if (rankBadge) {
        // 2秒後（ランクアップテキスト表示後）にグロー効果を追加
        setTimeout(() => {
            rankBadge.style.animation = 'badgeGlow 1s ease-in-out 2';
            
            // グロー効果終了後にアニメーションを削除
            setTimeout(() => {
                rankBadge.style.animation = '';
            }, 2000);
        }, 2000);
    }
}

// カレンダーページ用のランク情報表示関数
function updateCalendarRankDisplay() {
    // DOM要素が存在しない場合は処理をスキップ
    const rankStatusRow = document.querySelector('#rank-status-row');
    if (!rankStatusRow) {
        return;
    }
    
    const totalRehab = calculateAndSaveTotalRehab();
    const currentRank = getCurrentRank(totalRehab);
    const rankProgress = getRankProgress(totalRehab);
    
    const ranks = ['ビギナー', 'ブロンズ', 'シルバー', 'ゴールド', 'プラチナ'];
    const rankThresholds = {
        'ビギナー': 0,
        'ブロンズ': 10,
        'シルバー': 30,
        'ゴールド': 60,
        'プラチナ': 100
    };
    
    // 各ランクのセルを生成
    rankStatusRow.innerHTML = '';
    
    ranks.forEach(rank => {
        const cell = document.createElement('td');
        cell.className = 'text-center p-1';
        
        if (totalRehab >= rankThresholds[rank] && rank !== currentRank) {
            // 到達済みランク（現在ランク以外）
            const rankColor = getRankColor(rank);
            cell.innerHTML = `<i class="bi bi-award-fill" style="font-size: 2.2rem; color: ${rankColor};"></i>`;
        } else if (rank === currentRank) {
            // 現在のランク
            if (rank === 'プラチナ') {
                // プラチナは最高ランクなのでバッジアイコン表示
                const rankColor = getRankColor(rank);
                cell.innerHTML = `<i class="bi bi-award-fill" style="font-size: 2.2rem; color: ${rankColor};"></i>`;
            } else {
                // 次のランクまでの残り表示
                const remaining = rankProgress.required - rankProgress.current;
                cell.innerHTML = `
                    <div style="font-size: 1.0rem; line-height: 1.2;">
                        <div>あと</div>
                        <div style="font-size: 1.6rem; font-weight: bold;">${remaining}</div>
                        <div>ポイント</div>
                    </div>
                `;
            }
        } else {
            // 未到達ランク
            cell.innerHTML = `<i class="bi bi-award" style="font-size: 2.2rem; color: #6c757d;"></i>`;
        }
        
        rankStatusRow.appendChild(cell);
    });
}

// index.html用のランク情報表示関数
function updateIndexRankDisplay() {
    // DOM要素が存在しない場合は処理をスキップ
    const rankStatusRow = document.querySelector('#rank-status-row-index');
    if (!rankStatusRow) {
        return;
    }
    
    const totalRehab = calculateAndSaveTotalRehab();
    const currentRank = getCurrentRank(totalRehab);
    const rankProgress = getRankProgress(totalRehab);
    
    const ranks = ['ビギナー', 'ブロンズ', 'シルバー', 'ゴールド', 'プラチナ'];
    const rankThresholds = {
        'ビギナー': 0,
        'ブロンズ': 10,
        'シルバー': 30,
        'ゴールド': 60,
        'プラチナ': 100
    };
    
    // 各ランクのセルを生成
    rankStatusRow.innerHTML = '';
    
    ranks.forEach(rank => {
        const cell = document.createElement('td');
        cell.className = 'text-center p-1';
        
        let cellContent = '';
        
        if (totalRehab >= rankThresholds[rank] && rank !== currentRank) {
            // 到達済みランク（現在ランク以外）
            const rankColor = getRankColor(rank);
            cellContent = `<i class="bi bi-award-fill" style="font-size: 3rem; color: ${rankColor};"></i>`;
        } else if (rank === currentRank) {
            // 現在のランク
            const rankColor = getRankColor(rank);
            if (rank === 'プラチナ') {
                // プラチナは最高ランクなので塗りつぶしアイコンを表示
                cellContent = `<i class="bi bi-award-fill" style="font-size: 3rem; color: ${rankColor};"></i>`;
            } else {
                // その他のランクは輪郭のみのアイコンを表示
                cellContent = `<i class="bi bi-award" style="font-size: 3rem; color: ${rankColor};"></i>`;
            }
            // 現在のランクの下に「あなた」の吹き出しを追加
            cellContent += `<div><span class="current-rank-indicator" style="background-color: ${rankColor}; --indicator-color: ${rankColor};">あなた</span></div>`;
        } else {
            // 未到達ランク
            cellContent = `<i class="bi bi-award" style="font-size: 3rem; color: #6c757d;"></i>`;
        }
        
        cell.innerHTML = cellContent;
        rankStatusRow.appendChild(cell);
    });
}
