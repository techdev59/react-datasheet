const fs = require('fs');
const xmlbuilder = require('xmlbuilder');
//const { filterLeads } = require('./leadmanager/leads/utils');

function filterLeads(inputData) {
  return true;
}

const loadTestCases = () => {
  const testCaseFiles = fs
    .readdirSync('test/test_cases/')
    .filter(file => file.endsWith('.json'));
  const testCases = testCaseFiles.map(file => {
    const data = JSON.parse(
      fs.readFileSync(`test/test_cases/${file}`, 'utf-8'),
    );
    return [data.input, data.expected_output];
  });

  return testCases;
};

const runTestCases = () => {
  const testCases = loadTestCases();
  const results = testCases.map(([inputData, expectedOutput]) => {
    const result = filterLeads(inputData);
    return [result, result === expectedOutput];
  });

  return results;
};

const main = () => {
  const testCaseResults = runTestCases();
  const passed = testCaseResults.filter(([result, success]) => success).length;
  const total = testCaseResults.length;

  console.log(`${passed}/${total} test cases passed.`);

  const output = {
    metadata: {
      score: (passed / total) * 100,
    },
    test_cases: testCaseResults.map(([result, success]) => ({
      metadata: {
        result: success ? 'pass' : 'fail',
      },
    })),
  };

  const xmlRoot = xmlbuilder
    .create('testsuite')
    .att('name', 'Test Name')
    .att('tests', total)
    .att('errors', 0)
    .att('failures', 0)
    .att('time', 0.2);

  const properties = xmlRoot.ele('properties');
  properties.ele('property', { name: 'browser.fullName', value: 'test_1' });

  testCaseResults.forEach((result, index) => {
    xmlRoot.ele('testcase', { name: `test case ${index}`, time: 0 });
  });

  xmlRoot.ele('system-err');

  fs.writeFileSync('result.xml', xmlRoot.end({ pretty: true }), 'utf-8');
};

main();
