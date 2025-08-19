// last updated 2025.6.26
// 各リハビリのランダムIDを定義
const REHAB_IDS = {
    0: 'each0',    // 理学療法用
    1: 'each1',    // 言語療法用
    2: 'each2',    // 作業療法用
    3: 'each3'     // 心理療法用
};

// 逆引き用マッピング（ランダムIDから番号を取得）
const REHAB_ID_TO_INDEX = {};
Object.keys(REHAB_IDS).forEach(index => {
    REHAB_ID_TO_INDEX[REHAB_IDS[index]] = parseInt(index);
});

// ヘルパー関数
function getRehabId(index) {
    return REHAB_IDS[index] || `each${index}`;
}

function getIndexFromRehabId(rehabId) {
    return REHAB_ID_TO_INDEX[rehabId] !== undefined ? REHAB_ID_TO_INDEX[rehabId] : null;
}
