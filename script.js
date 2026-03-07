/* ══════════════════════════════════════
   CONFIGURAÇÃO
   ══════════════════════════════════════ */

const WHATSAPP = "5563999614831";

/* ══════════════════════════════════════
   PRODUTOS
   Campos:
   - name      : nome do produto
   - cat       : 'celular' | 'eletronico' | 'roupa' | 'outro'
   - catLabel  : nome legível da categoria
   - price     : preço formatado
   - condition : 'Novo' | 'Semi-novo' | 'Usado' | 'Recondicionado'
   - tag       : badge opcional ou null
   - desc      : descrição
   - images    : array de URLs (mínimo 1)
   ══════════════════════════════════════ */
const products = [
  {
    name: "iPhone 13 128GB",
    cat: "celular",
    catLabel: "Celular",
    oldPrice: "R$ 2.400",
    price: "R$ 2.350",
    condition: "Semi-novo",
    tag: "Oferta",
    desc: `iPhone 13 128GB branco, tudo funcionando
    * Nunca aberto (todo original)
    * Bateria 87%
    * Sem arranhões
    * Tela intacta
    * Com caixa

    Celular muito bem cuidado.
    Entrega do aparelho e repasse do valor direto comigo, dispenso espertinho`,
    images: [
      "imgs/iphone/pic1.jpeg",
      "imgs/iphone/pic2.jpeg",
      "imgs/iphone/pic3.jpeg",
      "imgs/iphone/pic4.jpeg",
      "imgs/iphone/pic5.jpeg",
      "imgs/iphone/pic6.jpeg",
    ],
  },
];

/* ══════════════════════════════════════
   RENDERIZAR LISTAGEM
   ══════════════════════════════════════ */
function renderCards(filter = "todos") {
  const listing = document.getElementById("listing");
  const countEl = document.getElementById("resultCount");
  listing.innerHTML = "";

  const filtered =
    filter === "todos" ? products : products.filter((p) => p.cat === filter);

  countEl.textContent = `${filtered.length} produto${filtered.length !== 1 ? "s" : ""}`;

  if (filtered.length === 0) {
    listing.classList.add("empty");
    return;
  }

  listing.classList.remove("empty");

  filtered.forEach((p, i) => {
    const originalIndex = products.indexOf(p);
    const card = document.createElement("div");
    card.className = "item-card";
    card.style.animationDelay = `${(i + 1) * 0.05}s`;

    card.innerHTML = `
      <div class="item-thumb">
        <img src="${p.images[0]}" alt="${p.name}" loading="lazy" />
        ${p.tag ? `<span class="item-tag">${p.tag}</span>` : ""}
        ${
          p.images.length > 1
            ? `
          <span class="item-photo-count">
            <svg width="10" height="10" fill="none" stroke="white" stroke-width="2" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            ${p.images.length}
          </span>`
            : ""
        }
      </div>
      <div class="item-content">
        <div>
          <div class="item-header">
            <div>
              <p class="item-cat">${p.catLabel}</p>
              <p class="item-name">${p.name}</p>
            </div>
            <div class="item-price">
              ${p.oldPrice ? `<span class="old-price">${p.oldPrice}</span>` : ""}
              <span class="new-price">${p.price}</span>
            </div>
            </div>
        </div>
        <div class="item-footer">
          <span class="item-condition">🏷 ${p.condition}</span>
          <button class="btn-ver">Ver detalhes</button>
        </div>
      </div>
    `;

    card.onclick = () => openModal(originalIndex);
    listing.appendChild(card);
  });
}

/* ══════════════════════════════════════
   FILTROS
   ══════════════════════════════════════ */
document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.onclick = () => {
    document
      .querySelectorAll(".filter-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    renderCards(btn.dataset.cat);
  };
});

/* ══════════════════════════════════════
   MODAL
   ══════════════════════════════════════ */
let currentProduct = null;
let currentImages = [];

function openModal(i) {
  const p = products[i];
  currentProduct = p;
  currentImages = p.images;

  // galeria
  const track = document.getElementById("galleryTrack");
  const dots = document.getElementById("galleryDots");

  track.innerHTML = p.images
    .map(
      (src, j) =>
        `<img class="gallery-img" src="${src}" alt="${p.name}" loading="lazy" data-index="${j}" />`,
    )
    .join("");

  dots.innerHTML = p.images
    .map((_, j) => `<div class="dot ${j === 0 ? "active" : ""}"></div>`)
    .join("");

  // clicar na foto abre lightbox
  track.querySelectorAll(".gallery-img").forEach((img) => {
    img.onclick = () => openLightbox(currentImages, +img.dataset.index);
  });

  track.scrollLeft = 0;
  track.onscroll = () => {
    const idx = Math.round(
      track.scrollLeft / (track.scrollWidth / p.images.length),
    );
    document
      .querySelectorAll(".dot")
      .forEach((d, j) => d.classList.toggle("active", j === idx));
  };

  document.getElementById("modalCat").textContent = p.catLabel;
  document.getElementById("modalName").textContent = p.name;
  document.getElementById("modalPrice").textContent = p.price;
  document.getElementById("modalCondition").textContent = `🏷 ${p.condition}`;
  document.getElementById('modalDesc').innerText = p.desc;

  const msg = encodeURIComponent(
    `Olá! Vi o catálogo do JáFoiMeu e tenho interesse no: ${p.name} (${p.price}). Ainda está disponível?`,
  );
  document.getElementById("modalWppBtn").href =
    `https://wa.me/${WHATSAPP}?text=${msg}`;

  document.getElementById("modalOverlay").classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  document.getElementById("modalOverlay").classList.remove("open");
  document.body.style.overflow = "";
}

document.getElementById("modalClose").onclick = closeModal;
document.getElementById("modalOverlay").onclick = (e) => {
  if (e.target.id === "modalOverlay") closeModal();
};

/* ══════════════════════════════════════
   LIGHTBOX FULLSCREEN
   ══════════════════════════════════════ */
let lbImages = [];
let lbCurrent = 0;

function openLightbox(images, startIndex = 0) {
  lbImages = images;
  lbCurrent = startIndex;
  updateLightbox();
  document.getElementById("lightbox").classList.add("open");
}

function closeLightbox() {
  document.getElementById("lightbox").classList.remove("open");
}

function updateLightbox() {
  const img = document.getElementById("lbImg");
  const counter = document.getElementById("lbCounter");
  const prev = document.getElementById("lbPrev");
  const next = document.getElementById("lbNext");

  img.src = lbImages[lbCurrent];
  counter.textContent = `${lbCurrent + 1} / ${lbImages.length}`;

  prev.classList.toggle("hidden", lbCurrent === 0);
  next.classList.toggle("hidden", lbCurrent === lbImages.length - 1);
}

document.getElementById("lbClose").onclick = closeLightbox;
document.getElementById("lbPrev").onclick = () => {
  if (lbCurrent > 0) {
    lbCurrent--;
    updateLightbox();
  }
};
document.getElementById("lbNext").onclick = () => {
  if (lbCurrent < lbImages.length - 1) {
    lbCurrent++;
    updateLightbox();
  }
};

document.getElementById("lightbox").onclick = (e) => {
  if (e.target.id === "lightbox" || e.target.id === "lbImg") closeLightbox();
};

document.addEventListener("keydown", (e) => {
  const lb = document.getElementById("lightbox");
  if (lb.classList.contains("open")) {
    if (e.key === "ArrowLeft" && lbCurrent > 0) {
      lbCurrent--;
      updateLightbox();
    }
    if (e.key === "ArrowRight" && lbCurrent < lbImages.length - 1) {
      lbCurrent++;
      updateLightbox();
    }
    if (e.key === "Escape") closeLightbox();
    return;
  }
  if (e.key === "Escape") closeModal();
});

/* ══════════════════════════════════════
   INIT
   ══════════════════════════════════════ */
renderCards();
document.getElementById("statTotal").textContent = products.length;
document.getElementById("footerYear").textContent = new Date().getFullYear();