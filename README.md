# Import Modules

A lightweight static gallery that renders a 3x3 grid of module cards from `window.MODULES`.

## What it does

- Loads module data from `modules.js`
- Renders each module in an iframe tile (`module-frame.html`)
- Displays video (`animation`) when present, otherwise image (`image`)
- Converts `ipfs://...` media URLs to HTTP gateway URLs at runtime

## Project files

- `index.html` - main shell and 3x3 grid layout
- `main.js` - creates one iframe tile per module
- `module-frame.html` - card UI used inside each tile
- `module-frame.js` - media selection/rendering logic
- `modules.js` - module data source

## Run locally

Because this is a static project, use any simple local server:

```bash
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

## Update modules

Edit `modules.js` and add/update entries in `window.MODULES`:

```js
{
  name: "Example module",
  description: "Short description",
  image: "https://...",
  animation: "https://..."
}
```

`animation` is optional. If both `image` and `animation` are missing, the tile shows `No media`.
