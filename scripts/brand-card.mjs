import { readFile } from "node:fs/promises";
import sharp from "sharp";

const mark = await readFile(new URL("../public/blen-light.svg", import.meta.url), "utf8");
const wordmark = mark.slice(mark.indexOf("<g "), mark.indexOf("</svg>"));
const card = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#171a24"/>
  <g fill="none" stroke="#536185" stroke-width="1.5">
    <path d="M860 0v125h171v148h-171v148h171v209"/>
    <path d="M1031 125h169M860 273H712v148h148M1031 421h169"/>
  </g>
  <g fill="#9aabff"><circle cx="860" cy="125" r="6"/><circle cx="1031" cy="273" r="6"/><circle cx="860" cy="421" r="6"/></g>
  <g transform="translate(90 158) scale(3.1)">${wordmark}</g>
  <text x="90" y="385" font-family="Arial,sans-serif" font-size="35" fill="#f7f7f3">Business clarity.</text>
  <text x="90" y="435" font-family="Arial,sans-serif" font-size="35" fill="#b8c3ff">Engineered intelligence.</text>
</svg>`;
await sharp(Buffer.from(card)).png().toFile(new URL("../public/social-card.png", import.meta.url).pathname.replace(/^\/(?=[a-z]:)/i, ""));
