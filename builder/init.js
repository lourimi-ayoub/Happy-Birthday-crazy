
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

// Download a URL without Axios or environment proxy settings
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

        if (
          [301, 302, 303, 307, 308].includes(status) &&
          location
        ) {
          response.resume();

          if (redirects <= 0) {
            reject(new Error("Too many redirects downloading " + url));
            return;
          }

          resolve(
            downloadUrl(new URL(location, parsed).href, redirects - 1)
          );
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

// Local initialization
const setLocalData = async () => {
  try {
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
  } catch (e) {
    throw new Error(e.message);
  }
};

// Remote initialization
const setRemoteData = async () => {
  try {
    console.log("Downloading image from:", new URL(picPath).hostname);
    const pic = await downloadUrl(picPath);

    let markup = "";

    if (msgPath) {
      const html = (await downloadUrl(msgPath)).toString("utf-8");
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
