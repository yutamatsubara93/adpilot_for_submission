/* --- Preview Panel Logic --- */

window.renderPreview = function(activeCardId) {
    const card = document.querySelector(`.creative-set-card[data-id="${activeCardId}"]`);
    if (!card) return;

    const h = card.querySelector('.input-headline').value || '見出しを入力';
    const b = card.querySelector('.input-body').value || '本文を入力';
    const logo = card.querySelector('.logo-preview').dataset.img || "";
    const main = card.querySelector('.main-preview').dataset.img || "";

    document.querySelectorAll('.ref-headline').forEach(el => el.innerText = h);
    document.querySelectorAll('.ref-body').forEach(el => el.innerText = b);
    document.querySelectorAll('.ref-img').forEach(el => { 
        el.style.backgroundImage = main ? `url('${main}')` : "none";
        el.style.backgroundSize = 'cover';
    });
    document.querySelectorAll('.ref-logo').forEach(el => { 
        el.style.backgroundImage = logo ? `url('${logo}')` : "none";
        el.style.backgroundSize = 'cover';
    });

    const total = document.querySelectorAll('.creative-set-card').length;
    const info = document.getElementById('p-current-info');
    if (info) info.innerText = `素材セット ${activeCardId} / ${total}`;
};
