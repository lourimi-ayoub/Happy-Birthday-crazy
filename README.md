# 🎂 Happy Birthday Crazy Card

A fun, interactive **web birthday card** with a little **horror story** surprise at the end. 🕯️👻🎉

Your friend starts in a dark room... glowing eyes watch them, a creepy hallway shakes, and a jump-scare hits — then BOOM, the happy birthday card appears with their picture, message, and music.

**🔗 Live template demo:** https://birthday-card-template-two.vercel.app

---

## ✨ What's inside

| Scene | What happens |
| ----- | ------------ |
| Dark room | Text messages + glowing eyes that follow the cursor |
| Empty room | Click the door to keep moving |
| Hallway | Screen shakes, heartbeat + haunted music |
| Gift room | Open the gift |
| JUMP-SCARE ⚡ | Silence → scream + static flash |
| The card 🎁 | Birthday message scrolls, then the card with photo & cake appears |

---

## 🚀 Deploy online (free, takes 5 min)

1. Upload the **birthday picture** to [telegra.ph](https://telegra.ph) and copy its image URL.
2. (Optional) Write a **birthday message** as a telegra.ph article, and copy its URL.
3. Run in your terminal:

```sh
npx vercel login
npx vercel --prod --yes \
  --build-env NAME='Your Friend Name' \
  --build-env PIC='https://i.ibb.co/xxxx/image.jpg' \
  --build-env NICKNAME='Nickname' \
  --build-env HBD_MSG='happy birthday to u' \
  --build-env SCROLL_MSG='https://telegra.ph/your-message'
```

> `PIC` and `SCROLL_MSG` must be hosted URLs — local files don't work on the server.

4. Open the printed URL (something like `https://your-app.vercel.app`) and send it to your friend! 🎈

---

## 💻 Run locally

1. Install Node.js, then:

```sh
npm install
```

2. Create a `.env` file in the project root:

```env
NAME='Friend Name'
PIC='sample-pic.jpeg'
NICKNAME='Nickname'
HBD_MSG='happy birthday to u'
SCROLL_MSG='sample-scroll.txt'
```

3. Put your picture in the `local/` folder (1:1 ratio works best). If `SCROLL_MSG` is set, also put your message text in `local/` (e.g. `sample-scroll.txt`).

4. Start the dev server:

```sh
npm run watch
```

5. Open **http://localhost:1234**

---

## 🛠️ Customize

Everything is text you can edit in `src/template.html` and `src/js/pages.js`.

- **Scene messages** — the story text (dark room, hallway, gift room) → `src/template.html`
- **Card greeting & nickname** — via env vars (`HBD_MSG`, `NICKNAME`)
- **Scroll message** — your telegra.ph article or local `.txt`
- **Horror timing** — change delays in `src/js/animation.js` (heartbeat, jump-scare, silence drop)

---

## 🧰 Tech

- Plain **HTML + Sass + vanilla JavaScript** (no framework needed)
- **Parcel** bundles everything
- **Node.js** builder (`builder/`) injects your name/picture/message at build time

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the project on GitHub
2. **Create** your feature branch:

   ```sh
   git checkout -b feature/AmazingFeature
   ```

3. **Commit** your changes:

   ```sh
   git commit -m 'Add some AmazingFeature'
   ```

4. **Push** the branch:

   ```sh
   git push origin feature/AmazingFeature
   ```

5. **Open** a Pull Request 🚀

---

## 👨‍💻 Author

**Lourimi Ayoub**

GitHub: [@lourimi](https://github.com/lourimi)

---

## 📬 Contact

Feel free to reach out to me at [lourimi.ayoub10@gmail.com](mailto:lourimi.ayoub10@gmail.com) or connect with me on [LinkedIn: Ayoub Lourimi](https://www.linkedin.com/in/lourimi-ayoub/) for more information.

---

## ⭐ Show Your Support

<div align="center">

Give a ⭐ if you like this website!

</div>
