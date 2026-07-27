# Recentify — Banner Maker
A small client-side web app that logs into Spotify, steals your name and
profile photo (with permission, relax), grabs your top artists, and lets
you slap together a shareable card image. basically a DIY "Spotify
Wrapped" banner, minus Spotify's design budget, plus your own banner art
and font choices. I Wanted one and made one for me.

No backend, no server, no database. It all happens in your browser like
it's 2009 and servers are expensive and I'm broke and Your Spotify data 
never leaves your machine except to go chat with Spotify's own API, which 
honestly already knows everything about you anyway.

https://skipos.github.io/skip0sAppRepo/Recentify/

## 1. Get a free Spotify Client ID

If you want to host your owns, you need to know: 
Spotify makes every app get its own Client ID, you can't just borrow
one, because the login screen literally shows the user which app is
asking to rifle through their data.

1. Go to https://developer.spotify.com/dashboard and log in with any
   Spotify account.
2. Click **Create app**. Name and description can be whatever nonsense
   you want, since Spotify doesn't care for developer mode.
3. For **Redirect URI**, enter the exact URL where you'll serve this app,
   e.g. `http://127.0.0.1:5500/index.html` or
   `https://yourname.github.io/repo-name/index.html`.
   - The app will tell you the exact redirect URI it wants once you open
     it — copy that in *exactly*, trailing slashes and all. Spotify does
     not do "close enough."
4. Check the **Web API** box under "Which API/SDKs are you planning to
   use."
5. Save, then open **Settings** on the app page and copy the **Client ID**.

## 2. Run the app locally

Because OAuth redirects are picky about their origin story, you can't
just double-click `index.html` and call it a day — a `file://` URL will
not round-trip correctly, and Spotify will look at you funny. Serve it
over `http://` or `https://` instead. Pick your poison:

**Python** (already lurking on most machines):
```
cd recentify
python3 -m http.server 5500
```
Then open `http://127.0.0.1:5500/` — and make sure that's the *exact*
string you used as your Redirect URI in the Spotify dashboard.

**VS Code**: install the "Live Server" extension, right-click
`index.html`, choose "Open with Live Server.".

**GitHub Pages**: push this folder to a repo, enable Pages, use the
published URL as your Redirect URI.

## 3. Use it

1. Paste your Client ID into the app and click **Connect to Spotify**.
2. Approve access on Spotify's login screen (yes, it's really you doing
   this, no you're not being hacked).
3. Pick a time range (last 4 weeks / 6 months / all time) bc this decides
   whether your "top artist" is the one you're embarrassed you streamed
   200 times last month, or your actual long-term taste.
4. Choose a banner: gradient preset, or upload your own image if the
   presets are too basic for you.
5. Edit the title text and pick fonts for the title and artist labels
   independently, because apparently one font per card is for cowards.
6. Click **Download PNG** and post it before you second-guess your top
   artist.

## Notes / limits

- Uses Authorization Code + PKCE flow, so no client secret is ever
  needed, stored, or accidentally leaked in a public repo (looking at
  literally every tutorial ever).
- Top artists come from Spotify's `/me/top/artists` endpoint, which runs
  on Spotify's own listening-history math so it can lag behind very
  recent listening, so don't panic if last night's 3am sad-song spiral
  isn't reflected yet.
- Fonts are pulled live from Google Fonts, so you need an internet
  connection to generate the card. Yes, still, even in this economy.
- The access token lives in `sessionStorage` and vanishes the second you
  close the tab. Nothing gets shipped off to a server, because there is
  no server. That's kind of the whole point.

  # Buy me a coffe
<a href="https://www.buymeacoffee.com/skip0s" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" height="41" width="174"></a>
