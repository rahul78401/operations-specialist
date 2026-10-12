# Operations-Specialist

Training guide for the Operations Specialist role. Plain HTML, CSS and JavaScript. No install and no build step.

## Run it

Open `index.html` in a browser, or serve the folder:

```
python -m http.server 6700
```

Then open http://localhost:6700. (Browsers block port 6666, so use another port.)

## Structure

```
index.html            all pages (one <section class="page"> each)
css/styles.css        theme
js/illustrations.js   SVG diagrams, placed with <figure class="figure" data-fig="name">
js/app.js             sidebar, routing, previous/next, JSON colouring
images/               pictures used in Session 0
```

## Add a session

Copy a `<section class="page">` block in `index.html` and change its `id`, `data-title` and `data-number`. The sidebar and the previous/next links update on their own.

## Add a diagram

Add a function to `js/illustrations.js`, list it in the `fig` object at the bottom, then put `<figure class="figure" data-fig="name"></figure>` in the page.

## Missing image

`images/api.png` (the API diagram in Session 0) could not be downloaded automatically. Save it there to show it on the page.
