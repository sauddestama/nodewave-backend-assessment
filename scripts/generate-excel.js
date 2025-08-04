const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Function to convert CSV to Excel
function csvToExcel(csvPath, excelPath) {
    try {
        // Read CSV file
        const csvData = fs.readFileSync(csvPath, 'utf8');
        
        // Parse CSV manually (simple implementation)
        const lines = csvData.trim().split('\n');
        const headers = lines[0].split(',');
        const data = lines.slice(1).map(line => {
            const values = line.split(',');
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            return row;
        });

        // Create workbook and worksheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(data);

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

        // Write Excel file
        XLSX.writeFile(workbook, excelPath);
        console.log(`✅ Generated: ${excelPath}`);
    } catch (error) {
        console.error(`❌ Error generating ${excelPath}:`, error.message);
    }
}

// Generate Excel files from CSV data
const testDataDir = path.join(__dirname, '..', 'test-data');

// Convert all CSV files to Excel
const csvFiles = [
    'sample-karyawan.csv',
    'sample-startup.csv', 
    'data-perusahaan-besar.csv'
];

csvFiles.forEach(csvFile => {
    const csvPath = path.join(testDataDir, csvFile);
    const excelPath = path.join(testDataDir, csvFile.replace('.csv', '.xlsx'));
    
    if (fs.existsSync(csvPath)) {
        csvToExcel(csvPath, excelPath);
    } else {
        console.error(`❌ CSV file not found: ${csvPath}`);
    }
});

console.log('\n🎉 Excel file generation complete!');
console.log('📁 Files available in test-data/ directory:');
console.log('  - sample-karyawan.xlsx (Indonesian tech company employees)');
console.log('  - sample-startup.csv (Indonesian startup ecosystem)');
console.log('  - data-perusahaan-besar.xlsx (Large Indonesian corporates)');
console.log('\n🚀 Ready for Postman testing!');