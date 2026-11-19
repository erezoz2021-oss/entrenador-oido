// Permite usar la app sin conexión: guarda la página y todas las notas en el móvil.
// Al cambiar la app, sube VERSION para que el móvil descargue la nueva.
const VERSION = "oido-v14";
const NOTAS = [];
for (const n of ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"]) {
  for (let o = 1; o <= 7; o++) NOTAS.push(`notas/${n}${o}.mp3`);
  NOTAS.push(`escuchar/${n}.mp3`);           // la nota en todas las octavas
}
const ARCHIVOS = ["./", "index.html", "manifest.json", "icono-192.png", "icono-512.png", ...NOTAS];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const esPagina = e.request.mode === "navigate";
  if (esPagina) {
    // la página: primero internet (para recibir mejoras), si no hay, la guardada
    e.respondWith(
      fetch(e.request)
        .then(r => { const copia = r.clone(); caches.open(VERSION).then(c => c.put("index.html", copia)); return r; })
        .catch(() => caches.match("index.html"))
    );
  } else {
    // audios e iconos: primero lo guardado
    e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(r => r || fetch(e.request)));
  }
});
