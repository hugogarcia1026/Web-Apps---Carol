# Atividade 006 — Web Apps (Programação Front-end)

Aplicações web progressivas (PWA) com **Service Worker**, **Cache API**, **Notificações** e **otimização de carregamento** (Resource Hints), tendo como tema a fábrica de sorvetes **GelatoArt**.

## Estrutura

```
atividade-006-web-apps/
├── exemplo-guiado/        # GelatoArt PWA — Painel da Fábrica de Sorvetes
│   ├── index.html
│   ├── promocoes.html     # página carregada via <link rel="prefetch">
│   ├── style.css
│   ├── app.js
│   └── sw.js
└── atividade-pratica/     # GelatoArt Repositor — Estoque e Pedidos
    ├── index.html
    ├── style.css
    ├── app.js
    ├── sw.js
    ├── manifest.json
    └── icon.svg
```

## Atividade prática: GelatoArt Repositor

Aplicativo PWA para vendedores e entregadores de campo registrarem pedidos de reposição de sorvetes e consultarem o estoque da fábrica.

| Requisito | Onde foi atendido |
|---|---|
| `<link rel="dns-prefetch">` para `https://cdn.jsdelivr.net` | `index.html` (`<head>`) |
| `<link rel="preload">` para `style.css` | `index.html` (`<head>`) |
| Cache estático de `index.html`, `style.css` e `app.js` | `sw.js` — evento `install` |
| Interceptar `fetch` para o formulário carregar offline | `sw.js` — evento `fetch` (Cache First + fallback para `index.html`) |
| Botão "Ativar Alertas de Reposição" com permissão e confirmação | `index.html` + `app.js` (`Notification.requestPermission()`) |
| Classe `.min-44` em botões e inputs | `index.html` + `style.css` |

Recursos extras:
- Indicador de conexão Online/Offline no cabeçalho;
- Formulário de reposição com validação e controle de estoque (alerta de estoque baixo);
- Pedidos e estoque persistidos no navegador com `localStorage` (funciona offline);
- Notificação a cada reposição registrada;
- `manifest.json` para instalar o app na tela inicial;
- Layout responsivo (CSS Grid, uma coluna no celular).

## Como executar

Service Workers só funcionam em `https://` ou em `http://localhost`, então abra os arquivos por meio de um servidor local (não pelo `file://`):

```bash
cd atividade-006-web-apps/atividade-pratica
python3 -m http.server 8080
```

Acesse `http://localhost:8080`. Para testar o modo offline, abra o DevTools → **Application** → **Service Workers** → marque **Offline** e recarregue a página. A extensão **Live Server** do VS Code também funciona.

## Referências

- EIS, Diego. *Guia Front-End: o caminho das pedras para ser um dev Front-End*. São Paulo: Casa do Código, 2014.
- LOPES, Sérgio (org.). *Coletânea Front-End: uma antologia da comunidade front-end brasileira*. São Paulo: Casa do Código, 2014.
- PUREWAL, Semmy. *Aprendendo a desenvolver aplicações web*. São Paulo: Novatec, 2014.
- SILVA, Danilo Augusto Bambini. *Sistemas web*. Valinhos: Editora e Distribuidora Educacional S.A., 2014.
