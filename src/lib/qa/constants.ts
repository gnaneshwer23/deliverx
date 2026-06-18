export const QA_SPECIALISATIONS = [
  { value: "manual", label: "Manual QA" },
  { value: "automation", label: "Automation QA" },
  { value: "performance", label: "Performance Testing" },
  { value: "security", label: "Security Testing" },
  { value: "uat", label: "UAT Lead" },
  { value: "release", label: "Release Manager" },
] as const;

export const QA_TESTING_TOOLS = [
  { value: "playwright", label: "Playwright" },
  { value: "cypress", label: "Cypress" },
  { value: "selenium", label: "Selenium" },
  { value: "postman", label: "Postman" },
  { value: "jmeter", label: "JMeter" },
  { value: "owasp_zap", label: "OWASP ZAP" },
] as const;
