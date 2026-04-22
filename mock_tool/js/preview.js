/* --- Preview Panel Logic --- */

window.renderPreview = function(activeCardId) {
    const card = document.querySelector(`.creative-set-card[data-id="${activeCardId}"]`);
    if (!card) return;

    // Use specific IDs for inputs to avoid conflicts if needed, but classes work here
    const h = card.querySelector('.input-headline').value || '見出しを入力';
    const b = card.querySelector('.input-body').value || '本文を入力';
    const logo = card.querySelector('.logo-preview').dataset.img || "";
    const main = card.querySelector('.main-preview').dataset.img || "";

    // Update Text Content
    document.querySelectorAll('.ref-headline').forEach(el => el.innerText = h);
    document.querySelectorAll('.ref-body').forEach(el => el.innerText = b);
    
    // Update Images
    document.querySelectorAll('.ref-img').forEach(el => { 
        if (main) {
            el.style.backgroundImage = `url('${main}')`;
            el.style.backgroundSize = 'cover';
        } else {
            el.style.backgroundImage = "none";
        }
    });
    
    document.querySelectorAll('.ref-logo').forEach(el => { 
        if (logo) {
            el.style.backgroundImage = `url('${logo}')`;
            el.style.backgroundSize = 'cover';
        } else {
            el.style.backgroundImage = "none";
        }
    });

    // Update Counter Info in Preview Header
    const total = document.querySelectorAll('.creative-set-card').length;
    const info = document.getElementById('p-current-info');
    if (info) info.innerText = `素材セット ${activeCardId} / ${total}`;
};
