 (async () => {
  const puppeteer = require("puppeteer");
  const browser = await puppeteer.launch({executablePath: '/usr/bin/chromium-browser', headless:false});
  const page = await browser.newPage();
  
  await page.goto('https://waic.github.io/wcag21/guidelines/');
  const principles = await mapPageToPrinciples(page,browser);
  console.log(JSON.stringify({principles}));
  await page.close()
 })();

const mapPageToPrinciples = async(page,browser) => {
  const principleElements = await page.$$(".principle");
  const principlePromises = principleElements.map(async (principleElement)=>{
    const titleElement = await principleElement.$("h2");
    const title = await titleElement.evaluate(el => el.textContent.replace("§","").replace(/ /g, ""));
    const guidelines = await mapPrincipleToGuidelines(principleElement,browser);
    return {title, guidelines}
  })
  return await Promise.all(principlePromises);
}

const mapPrincipleToGuidelines = async (principle,browser) => {
  const guidelineElements = await principle.$$(":scope > .guideline")
  const guidelinePromises = guidelineElements.map(async (guidlineElement)=> {
    const titleElement = await guidlineElement.$("h3");
    const title = await titleElement.evaluate(el => el.textContent.replace("§",""));

    const guidelineId = await guidlineElement.evaluate(el => el.id);
    const understandingDocLink = `https://waic.jp/translations/WCAG21/Understanding/${guidelineId}.html`;
    const page = await browser.newPage();
    await page.goto(understandingDocLink);

    const scquoteElement = await page.$(".scquote")
    const guidelineText = await scquoteElement.evaluate(el => el.innerText);
    // const guidelineHTML = await scquoteElement.evaluate(el => el.innerHTML);

    const intentElement = await page.$("#intent")
    const intentText = await intentElement.evaluate(el => el.innerText);
    // const intentHTML = await intentElement.evaluate(el => el.innerHTML);

    await page.close()

    const successCriteria = await mapGuidelineToSuccessCriteria(guidlineElement,browser);
    // return {title, guidelineText, guidelineHTML, intentText, intentHTML, successCriteria};
    return {title, guidelineText,  intentText, successCriteria};
  })
  return Promise.all(guidelinePromises)
}

const mapGuidelineToSuccessCriteria = async (guideline,browser) => {
  const successCriteriaElements = await guideline.$$(".guideline")
  const successCriteriaPromises = successCriteriaElements.map(async (successCriteriaElement)=> {
    const titleElement = await successCriteriaElement.$("h4");
    const title = await titleElement.evaluate(el => el.textContent.replace("§",""));

    const conformanceLevelElement = await successCriteriaElement.$(".conformance-level");
    const conformanceLevel = await conformanceLevelElement.evaluate(el => el.textContent.replace(/[^A]/g,""))

    const understandingDocLinkElement = await successCriteriaElement.$(".doclinks > a:nth-child(2)")
    const understandingDocLink = await understandingDocLinkElement.evaluate(el => el.href);

    const page = await browser.newPage();
    await page.goto(understandingDocLink)

    const scquoteElement = await page.$(".scquote")
    const successCriteriaText = await scquoteElement.evaluate(el => el.innerText);
    // const successCriteriaHTML = await scquoteElement.evaluate(el => el.innerHTML);

    const intentElement = await page.$("#intent")
    const intentText = await intentElement.evaluate(el => el.innerText);
    // const intentHTML = await intentElement.evaluate(el => el.innerHTML);

    const benefitsElement = await page.$("#benefits")
    const benefitsText = (await benefitsElement?.evaluate(el => el.innerText) || "");
    // const benefitsHTML = (await benefitsElement?.evaluate(el => el.innerHTML) || "");

    await page.close()
    
    // return {title,conformanceLevel,successCriteriaText, successCriteriaHTML, intentText, intentHTML, benefitsText, benefitsHTML};
    return {title,conformanceLevel,successCriteriaText, intentText, benefitsText};
  })
  return Promise.all(successCriteriaPromises);
}


