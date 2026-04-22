/* --- Settings Logic --- */

window.openSettingsModal = function(type) {
    const modal = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-body-content');
    const footer = document.getElementById('modal-footer-actions');
    
    let title = "";
    if (type === 'profile') title = "ユーザープロフィール";
    if (type === 'security') title = "セキュリティ";
    if (type === 'notif') title = "通知設定";
    if (type === 'api') title = "外部サービス連携";

    content.innerHTML = `<div class="view-title"><h2>${title} の設定</h2><p>この機能は現在開発中です。アカウント情報の変更、セキュリティ設定、通知設定、API連携などがここで行えます。</p></div>`;
    footer.innerHTML = `<button class="btn btn-secondary btn-modal-close">閉じる</button>`;
    modal.classList.add('active');
};
