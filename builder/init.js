
const https = require("https");
const http = require("http");
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

const downloadUrl = (url, redirects = 5) =>
  new Promise((resolve, reject) => {
    let parsed;

    try {
      parsed = new URL(url);
    } catch {
      reject(new Error("Invalid URL: " + url));
      return;
    }

    const client =
      parsed.protocol === "https:"
        ? https
        : parsed.protocol === "http:"
        ? http
        : null;

    if (!client) {
      reject(new Error("Unsupported URL protocol: " + parsed.protocol));
      return;
    }

    const request = client.get(
      parsed,
      { headers: { "User-Agent": "Happy-Birthday-Card/1.0" } },
      (response) => {
        const status = response.statusCode || 0;
        const location = response.headers.location;

        if ([301, 302, 303, 307, 308].includes(status) && location) {
          response.resume();

          if (redirects <= 0) {
            reject(new Error("Too many redirects downloading " + url));
            return;
          }

          resolve(downloadUrl(new URL(location, parsed).href, redirects - 1));
          return;
        }

        if (status < 200 || status >= 300) {
          response.resume();
          reject(new Error("Download failed with HTTP " + status));
          return;
        }

        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => resolve(Buffer.concat(chunks)));
        response.on("error", reject);
      }
    );

    request.setTimeout(20000, () => {
      request.destroy(new Error("Download timed out: " + url));
    });

    request.on("error", reject);
  });

const escapeHtml = (text) =>
  text.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);

const setLocalData = async () => {
  const pic = path.join(__dirname, "../local/", picPath);
  let markup = "";

  if (msgPath) {
    const text = fs.readFileSync(
      path.join(__dirname, "../local/", msgPath),
      "utf-8"
    );
    markup = generateMarkupLocal(text);
  }

  await setPic(pic);
  genIndex(markup);
};

const setRemoteData = async () => {
  try {
    console.log("Downloading image from:", new URL(picPath).hostname);
    const pic = await downloadUrl(picPath);

    let markup = "";

    if (msgPath) {
      let text;

      if (/^https?:\/\//i.test(msgPath)) {
        text = (await downloadUrl(msgPath)).toString("utf-8");

        const paras = [];
        const re = /<p>([\s\S]*?)<\/p>/gi;
        let match;

        while ((match = re.exec(text))) {
          const para = match[1].replace(/<[^>]*>/g, "").trim();
          if (para) paras.push(para);
        }

        markup = paras
          .map((para) => `<p>${escapeHtml(para)}</p>`)
          .join(" ");
      } else {
        // Plain text supplied directly through Vercel Environment Variables
        markup = msgPath
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => `<p>${escapeHtml(line)}</p>`)
          .join(" ");
      }
    }

    await setPic(pic);
    genIndex(markup);
    console.log("Remote initialization completed.");
  } catch (e) {
    console.error("Remote initialization failed:", e.message);
    throw e;
  }
};

if (process.argv[2] === "--local") {
  setLocalData().catch((e) => {
    console.error(e);
    process.exitCode = 1;
  });
} else if (process.argv[2] === "--remote") {
  setRemoteData().catch((e) => {
    console.error(e);
    process.exitCode = 1;
  });
} else {
  console.log("Fetch mode not specified.");
}
