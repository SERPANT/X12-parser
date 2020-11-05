const { X12parser } = require('x12-parser');
const { createReadStream } = require('fs');

/**
 * Parse a given file name.
 *
 * @param {string} fileName : file name
 * @param {string} fileLocation : file location
 */
function parseX12File(fileName, fileLocation) {
  let tempobj = {};
  let print = false;
  let parsedResult = [];

  // Create a new parser
  const myParser = new X12parser();
  myParser.on('error', (err) => {
    console.error(err);
  });

  // Create a read stream from a file
  const ediFile = createReadStream('./parser/t.txt');
  ediFile.on('error', (err) => {
    console.error(err);
  });

  // Handle events from the parser
  ediFile.pipe(myParser).on('data', (data) => {
    if (data.name === 'IEA') {
      finalresult = formatPatientClaim(parsedResult);

      finalresult.forEach((record) => {
        console.log(record);
        console.log('--------------------------------------------------------');
      });
    }

    if (data.name === 'HL' && data['3'] === 'PT') print = true;

    if (print) tempobj[data.name] = data;

    if (data.name === 'DTP' && tempobj['HL']) {
      print = false;
      parsedResult.push({ ...tempobj });
      tempobj = {};
    }
  });
}

/**
 *
 * @param {array} parsedResult : list of patient record to format.
 */
function formatPatientClaim(parsedResult) {
  return parsedResult.map((patientRecord) => {
    formatedPatientRecord = {
      patientName: patientRecord.NM1['3'] + patientRecord.NM1['4'],
      status: patientRecord.STC['1'],
      //  object: patientRecord,
    };

    if (patientRecord.STC[12]) {
      formatedPatientRecord['reason'] = patientRecord.STC[12];
    }

    return formatedPatientRecord;
  });
}

parseX12File();
