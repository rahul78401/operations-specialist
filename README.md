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
index.html                 intro, Session 0 and Sessions 3 to 7; includes the modules below
css/styles.css, modules.css  theme, tables, tasks, presentation mode
js/illustrations.js        SVG diagrams, placed with <figure data-fig="name" data-args='{...}'>
js/helpers.js              small HTML builders (block, table, code, task, module...)
js/content/session-1.js    Session 1: REST APIs and Postman (sections, last one is Tasks)
js/content/stripe.js       Session 2: Stripe (sections, last one is Tasks)
js/content/session-4.js, session-5.js  Sessions 4 and 5
js/app.js                  sidebar, routing, presentation mode, previous/next
images/                    pictures used in Session 0
```

## Present

Click **Present** on any page (or press `P`). The section opens full screen and you scroll through it. **Next** opens the next section of the module. Left and right arrow keys also move between sections, `Esc` exits.

## Tasks

Each module ends with a Tasks section. The solution stays hidden until "Show solution" is clicked.

## Add a section to a module

Open the module file in `js/content/`, add an object to `subs` with `key`, `title`, `lead` and `blocks`.

## Add a diagram

Add a function to `js/illustrations.js` and list it in the `fig` object. Generic `flow`, `duplex` and `panels` figures need no new code: pass their options with `fig('flow', caption, {...})`.

## Missing image

`images/api.png` (the API diagram in Session 0) could not be downloaded automatically. Save it there to show it on the page.
