/**
 * Runs a test suite. Used for unit testing.
 * @param {object} tests 
 * @param {function} setup 
 * @param {object} testData
 */
function runTests(tests, setup, testData) {
  
  passedTests = 0;
  failedTests = 0;
  
  for (let testName in tests) {
    
    try {
      tests[testName](setup(testData));
      passedTests++;
      // console.log(testName, "passed");
      // console.log();
    }
    catch (e) {
      console.log(testName, "failed");
      console.log();
      failedTests++;
    }
  }
  
  console.log("passed tests:", passedTests);
  console.log("failed tests:", failedTests);
  console.log();
  
}

module.exports = runTests;