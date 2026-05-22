export function buildPullQuoteHTML(quote: string, attribution: string): string {
  const safeQuote = quote.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const attr = attribution.trim();
  return [
    `<figure data-pull-quote class="pull-quote">`,
    `<blockquote>${safeQuote}</blockquote>`,
    attr ? `<figcaption>— ${attr}</figcaption>` : "",
    `</figure>`,
  ].join("");
}
