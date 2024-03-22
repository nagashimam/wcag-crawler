const fs = require("fs");
const result = JSON.parse(fs.readFileSync("./result.json", "utf8"));
const mobilityImpairment = "四肢障害のある人";
const hearingImpairment = "聴覚障害のある人";
const visualImpairment = "視覚障害のある人";
const cognitiveImpairment = "発達障害・認知障害のある人";

const scForMobilityImpairment = [];
const scForHearingImpairment = [];
const scForVisualImpairment = [];
const scForCognitiveImpairment = [];

result.principles.forEach((principle) => {
  principle.guidelines.forEach((guideline) => {
    guideline.successCriteria.forEach((sc) => {
      sc.beneficiaries?.forEach((beneficiary) => {
        if (beneficiary === mobilityImpairment) {
          scForMobilityImpairment.push(sc);
        }
        if (beneficiary === hearingImpairment) {
          scForHearingImpairment.push(sc);
        }
        if (beneficiary === visualImpairment) {
          scForVisualImpairment.push(sc);
        }
        if (beneficiary === cognitiveImpairment) {
          scForCognitiveImpairment.push(sc);
        }
      });
    });
  });
});
console.log(
  JSON.stringify({
    scForMobilityImpairment,
    scForHearingImpairment,
    scForVisualImpairment,
    scForCognitiveImpairment,
  })
);
