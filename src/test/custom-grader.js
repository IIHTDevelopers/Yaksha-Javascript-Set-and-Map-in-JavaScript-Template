const esprima = require('esprima');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const xmlBuilder = require('xmlbuilder');

// Define TestCaseResultDto
class TestCaseResultDto {
    constructor(methodName, methodType, actualScore, earnedScore, status, isMandatory, errorMessage) {
        this.methodName = methodName;
        this.methodType = methodType;
        this.actualScore = actualScore;
        this.earnedScore = earnedScore;
        this.status = status;
        this.isMandatory = isMandatory;
        this.errorMessage = errorMessage;
    }
}

// Define TestResults
class TestResults {
    constructor() {
        this.testCaseResults = {};
        this.customData = '';  // Include custom data from the file
    }
}

// Function to read the custom.ih file
function readCustomFile() {
    let customData = '';
    try {
        customData = fs.readFileSync('../custom.ih', 'utf8');
    } catch (err) {
        console.error('Error reading custom.ih file:', err);
    }
    return customData;
}

// Function to send test case result to the server
async function sendResultToServer(testResults) {
    try {
        const response = await axios.post('https://compiler.techademy.com/v1/mfa-results/push', testResults, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log('Server Response:', response.data);
    } catch (error) {
        console.error('Error sending data to server:', error);
    }
}

// Function to generate the XML report
function generateXmlReport(result) {
    const xml = xmlBuilder.create('test-cases')
        .ele('case')
        .ele('test-case-type', result.status)
        .up()
        .ele('name', result.methodName)
        .up()
        .ele('status', result.status)
        .up()
        .end({ pretty: true });
    return xml;
}

// Function to write to output files
function writeOutputFiles(result, fileType) {
    const outputFiles = {
        functional: "./output_revised.txt",
        boundary: "./output_boundary_revised.txt",
        exception: "./output_exception_revised.txt",
        xml: "./yaksha-test-cases.xml"
    };

    let resultStatus = result.status === 'Pass' ? 'PASS' : 'FAIL';
    let output = `${result.methodName}=${resultStatus}\n`;

    let outputFilePath = outputFiles[fileType];
    if (outputFilePath) {
        fs.appendFileSync(outputFilePath, output);
    }
}

// Function to check if Set is used correctly by reading the file line by line
function checkSetUsage() {
    let result = 'Pass';
    let feedback = [];
    let setUsed = false;
    let setAddUsed = false;
    let setDeleteUsed = false;
    let setHasUsed = false;

    // Read the file line by line as a string
    const filePath = path.join(__dirname, '../', 'index.js');
    console.log(filePath);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    // Check for the presence of relevant Set methods
    if (fileContent.includes('.add(')) {
        setUsed = true;
        setAddUsed = true;
    }

    if (fileContent.includes('.delete(')) {
        setUsed = true;
        setDeleteUsed = true;
    }

    if (fileContent.includes('.has(')) {
        setUsed = true;
        setHasUsed = true;
    }

    // Feedback if Set methods are missing
    if (!setUsed) {
        result = 'Fail';
        feedback.push("You must use a Set object.");
    }
    if (!setAddUsed) {
        result = 'Fail';
        feedback.push("You must use the add() method on the Set.");
    }
    if (!setDeleteUsed) {
        result = 'Fail';
        feedback.push("You must use the delete() method on the Set.");
    }
    if (!setHasUsed) {
        result = 'Fail';
        feedback.push("You must use the has() method on the Set.");
    }

    // Detailed logging of the check
    console.log(`\x1b[33mChecking Set usage\x1b[0m`);

    return new TestCaseResultDto(
        'SetUsage',
        'functional',
        1,
        result === 'Pass' ? 1 : 0,
        result,
        true,
        feedback.join(', ')
    );
}

// Function to check if Map is used correctly by reading the file line by line
function checkMapUsage() {
    let result = 'Pass';
    let feedback = [];
    let mapUsed = false;
    let mapSetUsed = false;
    let mapDeleteUsed = false;
    let mapHasUsed = false;

    // Read the file line by line as a string
    const filePath = path.join(__dirname, '../', 'index.js');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    // Check for the presence of relevant Map methods
    if (fileContent.includes('.set(')) {
        mapUsed = true;
        mapSetUsed = true;
    }

    if (fileContent.includes('.delete(')) {
        mapUsed = true;
        mapDeleteUsed = true;
    }

    if (fileContent.includes('.has(')) {
        mapUsed = true;
        mapHasUsed = true;
    }

    // Feedback if Map methods are missing
    if (!mapUsed) {
        result = 'Fail';
        feedback.push("You must use a Map object.");
    }
    if (!mapSetUsed) {
        result = 'Fail';
        feedback.push("You must use the set() method on the Map.");
    }
    if (!mapDeleteUsed) {
        result = 'Fail';
        feedback.push("You must use the delete() method on the Map.");
    }
    if (!mapHasUsed) {
        result = 'Fail';
        feedback.push("You must use the has() method on the Map.");
    }

    // Detailed logging of the check
    console.log(`\x1b[33mChecking Map usage\x1b[0m`);

    return new TestCaseResultDto(
        'MapUsage',
        'functional',
        1,
        result === 'Pass' ? 1 : 0,
        result,
        true,
        feedback.join(', ')
    );
}

// Function to check if both Set and Map are used correctly
function checkSetAndMapUsage(ast) {
    let result = 'Pass';
    let feedback = [];
    let setUsed = false;
    let mapUsed = false;

    ast.body.forEach((node) => {
        if (node.type === 'ExpressionStatement' && node.expression.type === 'CallExpression') {
            const callee = node.expression.callee;
            
            // Check for Set usage
            if (callee.type === 'MemberExpression' && callee.object.type === 'Identifier' && callee.object.name === 'fruitsSet') {
                if (callee.property.name === 'add' || callee.property.name === 'delete' || callee.property.name === 'has') {
                    setUsed = true;
                }
            }

            // Check for Map usage
            if (callee.type === 'MemberExpression' && callee.object.type === 'Identifier' && callee.object.name === 'fruitsMap') {
                if (callee.property.name === 'set' || callee.property.name === 'delete' || callee.property.name === 'has') {
                    mapUsed = true;
                }
            }
        }
    });

    // Check if both Set and Map have been used
    if (!setUsed) {
        result = 'Fail';
        feedback.push("You must use a Set object correctly (add, delete, or has).");
    }
    if (!mapUsed) {
        result = 'Fail';
        feedback.push("You must use a Map object correctly (set, delete, or has).");
    }

    // Detailed logging of the check
    console.log(`\x1b[33mChecking Set and Map usage\x1b[0m`);

    return new TestCaseResultDto(
        'SetAndMapUsage',
        'functional',
        1,
        result === 'Pass' ? 1 : 0,
        result,
        true,
        feedback.join(', ')
    );
}

// Function to grade the student's code
function gradeAssignment() {
    const studentFilePath = path.join(__dirname, '..', 'index.js');
    let studentCode;

    try {
        studentCode = fs.readFileSync(studentFilePath, 'utf-8');
    } catch (err) {
        console.error("Error reading student's file:", err);
        return;
    }

    const ast = esprima.parseScript(studentCode);

    // Execute checks and prepare testResults
    const testResults = new TestResults();
    const GUID = "d805050e-a0d8-49b0-afbd-46a486105170";  // Example GUID for each test case

    // Assign the results of each test case
    testResults.testCaseResults[GUID] = checkSetUsage(ast);
    testResults.testCaseResults[GUID + '-map-usage'] = checkMapUsage(ast);
    testResults.testCaseResults[GUID + '-set-and-map-usage'] = checkSetAndMapUsage(ast);

    // Read custom data from the custom.ih file
    testResults.customData = readCustomFile();

    // Send the results of each test case to the server
    Object.values(testResults.testCaseResults).forEach(testCaseResult => {
        const resultsToSend = {
            testCaseResults: {
                [GUID]: testCaseResult
            },
            customData: testResults.customData
        };

        console.log("Sending below data to server");
        console.log(resultsToSend);

        // Log the test result in yellow for pass and red for fail using ANSI codes
        if (testCaseResult.status === 'Pass') {
            console.log(`\x1b[33m${testCaseResult.methodName}: Pass\x1b[0m`); // Yellow for pass
        } else {
            console.log(`\x1b[31m${testCaseResult.methodName}: Fail\x1b[0m`); // Red for fail
        }

        // Send each result to the server
        sendResultToServer(resultsToSend);
    });

    // Generate XML report for each test case
    Object.values(testResults.testCaseResults).forEach(result => {
        const xml = generateXmlReport(result);
        fs.appendFileSync('./test-report.xml', xml);
    });

    // Write to output files for each test case
    Object.values(testResults.testCaseResults).forEach(result => {
        writeOutputFiles(result, 'functional');
    });
}

// Function to delete output files
function deleteOutputFiles() {
    const outputFiles = [
        "./output_revised.txt",
        "./output_boundary_revised.txt",
        "./output_exception_revised.txt",
        "./yaksha-test-cases.xml"
    ];

    outputFiles.forEach(file => {
        // Check if the file exists
        if (fs.existsSync(file)) {
            // Delete the file if it exists
            fs.unlinkSync(file);
            console.log(`Deleted: ${file}`);
        }
    });
}

// Function to delete output files and run the grading function
function executeGrader() {
    // Delete all output files first
    deleteOutputFiles();

    // Run the grading function
    gradeAssignment();
}

// Execute the custom grader function
executeGrader();
