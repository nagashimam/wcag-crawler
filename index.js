(async () => {
  const puppeteer = require("puppeteer");
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();

  await page.goto("https://waic.jp/translations/WCAG22/");
  const principles = await mapPageToPrinciples(page, browser);
  console.log(JSON.stringify({ principles }));
  await page.close();
})();

const mapPageToPrinciples = async (page, browser) => {
  const principleElements = await page.$$(".principle");
  const principlePromises = principleElements.map(async (principleElement) => {
    const titleElement = await principleElement.$("h2");
    const title = await titleElement.evaluate((el) =>
      el.textContent.replace("§", "").replace(/ /g, "")
    );
    const guidelines = await mapPrincipleToGuidelines(
      principleElement,
      browser
    );
    return { title, guidelines };
  });
  return await Promise.all(principlePromises);
};

const mapPrincipleToGuidelines = async (principle, browser) => {
  const guidelineElements = await principle.$$(":scope > .guideline");
  const guidelinePromises = guidelineElements.map(async (guidelineElement) => {
    const titleElement = await guidelineElement.$("h3");
    const title = await titleElement.evaluate((el) =>
      el.textContent.replace("§", "")
    );
    const guidelineText = await guidelineElement.evaluate((el) => {
      const cloned = el.cloneNode(true);
      cloned.querySelector(".header-wrapper").remove();
      cloned.querySelector(".doclinks").remove();
      cloned.querySelector(".guideline").remove();
      return cloned.innerText;
    });

    const guidelineId = await guidelineElement.evaluate((el) => el.id);
    const understandingDocLink = `https://www.w3.org/WAI/WCAG22/Understanding/${guidelineId}.html`;
    const page = await browser.newPage();
    await page.goto(understandingDocLink);

    const intentElement = await page.$("#intent");
    const intentText = await intentElement.evaluate((el) => el.innerText);

    await page.close();

    const successCriteria = await mapGuidelineToSuccessCriteria(
      guidelineElement,
      browser
    );
    return { title, guidelineText, intentText, successCriteria };
  });
  return Promise.all(guidelinePromises);
};

const mapGuidelineToSuccessCriteria = async (guideline, browser) => {
  const successCriteriaElements = await guideline.$$(".guideline");
  const successCriteriaPromises = successCriteriaElements.map(
    async (successCriteriaElement) => {
      const titleElement = await successCriteriaElement.$("h4");
      const title = await titleElement.evaluate((el) =>
        el.textContent.replace("§", "")
      );

      const conformanceLevelElement = await successCriteriaElement.$(
        ".conformance-level"
      );
      const conformanceLevel =
        (await conformanceLevelElement?.evaluate((el) =>
          el.textContent.replace(/[^A]/g, "")
        )) || ""; // 削除された項目には適合レベルの記載がない
      const successCriteriaText = await successCriteriaElement.evaluate(
        (el) => {
          const cloned = el.cloneNode(true);
          cloned.querySelector(".header-wrapper").remove();
          cloned.querySelector(".doclinks").remove();
          cloned.querySelector(".conformance-level")?.remove();
          return cloned.innerText;
        }
      );

      // まだ日本語訳がない
      const understandingDocLinkElement = await successCriteriaElement.$(
        ".doclinks > a"
      );
      const understandingDocLink = await understandingDocLinkElement.evaluate(
        (el) => el.href
      );

      const page = await browser.newPage();
      await page.goto(understandingDocLink);

      const intentElement = await page.$("#intent");
      const intentText = await intentElement.evaluate((el) => el.innerText);

      const benefitsElement = await page.$("#benefits");
      const benefitsText =
        (await benefitsElement?.evaluate((el) => el.innerText)) || "";

      await page.close();

      return {
        title,
        conformanceLevel,
        successCriteriaText,
        intentText,
        benefitsText,
        understandingDocLink,
      };
    }
  );
  return Promise.all(successCriteriaPromises);
};
