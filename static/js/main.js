document.addEventListener('DOMContentLoaded', function() {
    const content = document.getElementById('js-content');
    const navLinks = document.querySelectorAll('#js-navigation a');
    const progressBar = document.getElementById('reading-progress');

    function loadBook(url, pushHistory = true) {
        content.innerHTML = '<div class="text-center p-5"><div class="spinner-border text-danger"></div><p>Ładowanie...</p></div>';
        navLinks.forEach(a => a.classList.remove('active','bg-danger','text-white'));
        let active = document.querySelector('#js-navigation a[href="' + url + '"]');
        if (active) { active.classList.add('active','bg-danger','text-white'); document.title = 'Pan Tadeusz - ' + active.textContent.trim(); }
        fetch(url).then(r=>{if(!r.ok)throw new Error(r.status);return r.text();}).then(html=>{
            content.innerHTML = html; applyFontSize();
        }).catch(err=>{
            content.innerHTML = '<div class="alert alert-danger">Nie udało się załadować: '+url+'</div>';
        });
        localStorage.setItem('ostatniaKsiega', url);
        if (pushHistory) history.pushState({url:url}, '', '?ksiega='+url);
    }

    let startUrl = localStorage.getItem('ostatniaKsiega') || 'home.html';
    let p = new URLSearchParams(window.location.search).get('ksiega');
    if (p) startUrl = p;
    loadBook(startUrl, false);

    document.getElementById('js-navigation').addEventListener('click', function(e){
        let a = e.target.closest('a'); if(!a) return;
        e.preventDefault(); loadBook(a.getAttribute('href'), true);
    });

    window.addEventListener('scroll', function(){
        let s = document.documentElement.scrollTop;
        let h = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        progressBar.style.width = (h>0 ? (s/h)*100 : 0) + '%';
    });

    let search = document.getElementById('search-books');
    if(search) search.addEventListener('keyup', function(){
        let v=this.value.toLowerCase();
        navLinks.forEach(a=>{a.style.display = a.textContent.toLowerCase().includes(v) ? '' : 'none';});
    });

    let currentFontSize = parseInt(localStorage.getItem('fontSize')) || 16;
    function applyFontSize(){ content.style.fontSize = currentFontSize+'px'; localStorage.setItem('fontSize', currentFontSize); }
    document.getElementById('font-plus')?.addEventListener('click', ()=>{ if(currentFontSize<26){currentFontSize+=2; applyFontSize();}});
    document.getElementById('font-minus')?.addEventListener('click', ()=>{ if(currentFontSize>12){currentFontSize-=2; applyFontSize();}});
    applyFontSize();

    let darkMode = localStorage.getItem('darkMode')==='true';
    let darkToggle = document.getElementById('dark-toggle');
    function applyDarkMode(){
        if(darkMode){ document.body.classList.add('bg-dark','text-light'); darkToggle.textContent='Tryb jasny'; }
        else{ document.body.classList.remove('bg-dark','text-light'); darkToggle.textContent='Tryb nocny'; }
        localStorage.setItem('darkMode', darkMode);
    }
    applyDarkMode();
    darkToggle?.addEventListener('click', ()=>{ darkMode=!darkMode; applyDarkMode(); });

    let form = document.getElementById('comment-form');
    if(form){
        form.addEventListener('submit', function(e){
            e.preventDefault();
            let data = Object.fromEntries(new FormData(this).entries());
            fetch('/api/comment',{method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data)})
            .then(r=>r.json()).then(res=>{
                document.getElementById('form-message').innerHTML='<div class="alert alert-success">'+res.message+'</div>';
                form.reset();
            });
        });
    }
});
