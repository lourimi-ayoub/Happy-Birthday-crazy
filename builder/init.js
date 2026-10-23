
const axios = require("axios").default;
const path = require("path");
const fs = require("fs");
const setPic = require("./getPic");
const genIndex = require("./genIndex");
const { generateMarkupLocal } = require("./generateMarkup");

require("dotenv").config();

if (!process.env.NAME) {
  throw new Error("Please specify NAME in environment.");
}

if (!process.env.PIC) {
  throw new Error("Please specify PIC in environment.");
}

const picPath = process.env.PIC;
const msgPath = process.env.SCROLL_MSG;

// Local initialization
const setLocalData = async () => {
  try {
    const pic = path.join(__dirname, "../local/", picPath);
    let markup = "";

    if (msgPath) {
      const text = fs.readFileSync(
        path.join(__dirname, "../local/", msgPath),
        { encoding: "utf-8" }
      );

      markup = generateMarkupLocal(text);
    }

    await setPic(pic);
    genIndex(markup);
  } catch (e) {
    throw new Error(e.message);
  }
};

// Remote initialization
const setRemoteData = async () => {
  try {
    console.log("PIC hostname:", new URL(picPath).hostname);

    let res = await axios.get(picPath, {
      responseType: "arraybuffer",
      proxy: false,
      timeout: 20000,
    });

    const pic = res.data;
    let markup = "";

    if (msgPath) {
      res = await axios.get(msgPath, {
        proxy: false,
        timeout: 20000,
      });

      const html = res.data;
      const paras = [];
      const re = /<p>([\s\S]*?)<\/p>/g;
      let m;

      while ((m = re.exec(html))) {
        paras.push(m[1].replace(/<[^>]+>/g, "").trim());
      }

      markup = paras
        .filter(Boolean)
        .map(
          (para) =>
            `<p>${para
              .replace(/&#(\d+);/g, (_, c) =>
                String.fromCharCode(+c)
              )
              .replace(/&amp;/g, "&")
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'")
              .replace(/&lt;/g, "<")
              .replace(/&gt;/g, ">")}</p> `
        )
        .join("");
    }

    await setPic(pic);
    genIndex(markup);
  } catch (e) {
    console.error("Remote initialization failed:", e.message);
    throw new Error(e.message);
  }
};

if (process.argv[2] === "--local") {
  setLocalData();
} else if (process.argv[2] === "--remote") {
  setRemoteData();
} else {
  console.log("Fetch mode not specified.");
}
