
// MODAL
function openModal(){
  document.getElementById('formModal').classList.add('show');
  document.body.style.overflow='hidden';
}
function closeModal(){
  document.getElementById('formModal').classList.remove('show');
  document.body.style.overflow='';
}
document.getElementById('formModal').addEventListener('click',function(e){
  if(e.target===this)closeModal();
});
function submitModal(){
  const name=document.getElementById('m-name').value.trim();
  const phone=document.getElementById('m-phone').value.trim();
  const url=document.getElementById('m-url').value.trim();
  const budget=document.getElementById('m-budget').value;
  const type=document.getElementById('m-type').value;
  if(!name){alert('من فضلك أدخل اسمك');return;}
  if(!phone){alert('من فضلك أدخل رقم جوالك');return;}
  if(!budget){alert('من فضلك اختر الميزانية');return;}

  const btn=document.querySelector('#modalFormContent .f-submit');
  const originalHtml=btn.innerHTML;
  btn.disabled=true;
  btn.innerHTML='جاري الإرسال...';

  fetch('https://formspree.io/f/mljrbeno',{
    method:'POST',
    headers:{'Content-Type':'application/json','Accept':'application/json'},
    body:JSON.stringify({
      formType:'نافذة الاستشارة المجانية',
      name:name,
      phone:phone,
      storeUrl:url,
      budget:budget,
      businessType:type
    })
  }).then(function(res){
    if(res.ok){
      document.getElementById('modalFormContent').style.display='none';
      document.getElementById('modalSuccess').style.display='block';
      setTimeout(closeModal,4000);
    }else{
      alert('حصل خطأ أثناء الإرسال، من فضلك حاول مرة أخرى أو تواصل معنا عبر واتساب.');
    }
  }).catch(function(){
    alert('حصل خطأ أثناء الإرسال، من فضلك حاول مرة أخرى أو تواصل معنا عبر واتساب.');
  }).finally(function(){
    btn.disabled=false;
    btn.innerHTML=originalHtml;
  });
}

// INLINE FORM
function submitInline(){
  const name=document.getElementById('i-name').value.trim();
  const phone=document.getElementById('i-phone').value.trim();
  const url=document.getElementById('i-url').value.trim();
  const budget=document.getElementById('i-budget').value;
  const type=document.getElementById('i-type').value;
  if(!name){alert('من فضلك أدخل اسمك');return;}
  if(!phone){alert('من فضلك أدخل رقم جوالك');return;}
  if(!budget){alert('من فضلك اختر الميزانية');return;}

  const btn=document.querySelector('#inlineFormContent .f-submit');
  const originalHtml=btn.innerHTML;
  btn.disabled=true;
  btn.innerHTML='جاري الإرسال...';

  fetch('https://formspree.io/f/mljrbeno',{
    method:'POST',
    headers:{'Content-Type':'application/json','Accept':'application/json'},
    body:JSON.stringify({
      formType:'النموذج المدمج أسفل الصفحة',
      name:name,
      phone:phone,
      storeUrl:url,
      budget:budget,
      businessType:type
    })
  }).then(function(res){
    if(res.ok){
      document.getElementById('inlineFormContent').style.display='none';
      document.getElementById('inlineSuccess').style.display='block';
    }else{
      alert('حصل خطأ أثناء الإرسال، من فضلك حاول مرة أخرى أو تواصل معنا عبر واتساب.');
    }
  }).catch(function(){
    alert('حصل خطأ أثناء الإرسال، من فضلك حاول مرة أخرى أو تواصل معنا عبر واتساب.');
  }).finally(function(){
    btn.disabled=false;
    btn.innerHTML=originalHtml;
  });
}

// CAROUSEL
let cIdx=0;
const slides=document.querySelectorAll('.case-slide');
const track=document.getElementById('casesTrack');
const dotsC=document.getElementById('dots');
const perView=()=>window.innerWidth<960?1:3;
const maxIdx=()=>Math.max(0,slides.length-perView());

if(track && dotsC && slides.length){
  function buildDots(){
    dotsC.innerHTML='';
    const total=maxIdx()+1;
    for(let i=0;i<total;i++){
      const d=document.createElement('div');
      d.className='cdot'+(i===cIdx?' on':'');
      d.onclick=()=>goCase(i);
      dotsC.appendChild(d);
    }
  }
  window.goCase=function(i){
    cIdx=Math.max(0,Math.min(i,maxIdx()));
    const cardW=track.parentElement.offsetWidth/perView()-20*(perView()-1)/perView();
    const offset=cIdx*(cardW+20);
    track.style.transform=`translateX(${offset}px)`;
    document.querySelectorAll('.cdot').forEach((d,j)=>d.classList.toggle('on',j===cIdx));
  }
  window.slideCase=function(dir){goCase(cIdx-dir);}
  buildDots();
  window.addEventListener('resize',()=>{buildDots();goCase(0);});
}

// FAQ
function toggleFaq(el){
  const item=el.parentElement;
  const open=item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(i=>i.classList.remove('open'));
  if(!open)item.classList.add('open');
}

// SCROLL REVEAL
const obs=new IntersectionObserver((entries)=>{
  entries.forEach((e,i)=>{
    if(e.isIntersecting){
      setTimeout(()=>e.target.classList.add('on'),i*80);
      obs.unobserve(e.target);
    }
  });
},{threshold:.07,rootMargin:'0px 0px -24px 0px'});
document.querySelectorAll('.rv').forEach(el=>obs.observe(el));

// NAV SHRINK
window.addEventListener('scroll',()=>{
  document.getElementById('mainNav').style.height=window.scrollY>40?'54px':'66px';
});
