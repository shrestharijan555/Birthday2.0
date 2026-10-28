# Birthday site

A static site: no build step, no server. Works on GitHub Pages.

## Change what it shows (edit `config.js` only)
- `name`, messages, and the final line
- `photos`: list your file names, in order. Add or remove lines freely.
  Two photos per page. The heart at the end uses all of them.
- `music`: path to your song

## Add your files
- Photos go in `photos/`  (e.g. `photos/1.jpg`)
- Song goes in `music/song.mp3`
- Resize photos to about 1200px wide first so they load fast on a phone.
  Keep the mp3 under about 8 MB.

## Put it online with GitHub Pages
1. Create a new repository on GitHub (it must be public for free Pages).
2. Upload everything in this folder (index.html, style.css, app.js,
   config.js, photos/, music/) to the repository root.
3. Repository Settings > Pages > "Deploy from a branch" > branch `main`,
   folder `/ (root)` > Save.
4. After a minute your link appears: `https://YOUR-USERNAME.github.io/REPO-NAME/`

## Notes
- Anyone with the link can see the photos. Use a hard-to-guess repository name.
- Browsers block music until a tap, which is why the first screen says "Tap to begin".
- To test locally, double-click index.html, or run `python3 -m http.server`
  in this folder and open http://localhost:8000
- Use a song you have the right to use.
