// app.js

// Initialize CodeMirror editor
const editor = CodeMirror.fromTextArea(document.getElementById('code-editor'), {
    mode: 'python',
    lineNumbers: true,
    theme: 'default',
    indentUnit: 4,
    tabSize: 4,
});

editor.setCursor(0, 0);

// Handle language selection
document.getElementById('language').addEventListener('change', function() {
    const language = this.value;
    switch (language) {
        case 'python':
            editor.setOption('mode', 'python');
            break;
        case 'javascript':
            editor.setOption('mode', 'javascript');
            break;
        case 'java':
            editor.setOption('mode', 'text/x-java');
            break;
        // Add more cases for other languages
    }
    editor.setCursor(0, 0);
});

// Handle code submission
document.getElementById('submit-code').addEventListener('click', async function() {
    const language = document.getElementById('language').value;
    const code = editor.getValue();
    const resultDiv = document.getElementById('result');

    // Call API to evaluate the code
    const response = await fetch('/api/submit-code', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ language, code }),
    });

    const result = await response.json();

    // Display the result
    resultDiv.innerHTML = `
        <h2>Result</h2>
        <p><strong>Status:</strong> ${result.status}</p>
        <p><strong>Output:</strong></p>
        <pre>${result.output}</pre>
        <p><strong>Marks:</strong> ${result.marks}</p>
    `;
});





// server.js

const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');

const app = express();
app.use(bodyParser.json());

app.post('/api/submit-code', (req, res) => {
    const { language, code } = req.body;

    // Define commands for different languages
    let command;
    switch (language) {
        case 'python':
            command = `python -c "${code.replace(/"/g, '\\"')}"`;
            break;
        case 'javascript':
            command = `node -e "${code.replace(/"/g, '\\"')}"`;
            break;
        case 'java':
            // Save code to a file and compile/run
            require('fs').writeFileSync('Main.java', code);
            command = 'javac Main.java && java Main';
            break;
        // Add more cases for other languages
    }

    // Execute the command
    exec(command, (error, stdout, stderr) => {
        if (error) {
            res.json({ status: 'Error', output: stderr, marks: 0 });
        } else {
            // Simple evaluation: Check if there is any output
            let marks = stdout ? 1 : 0; // Example scoring: 1 mark for output
            res.json({ status: 'Success', output: stdout, marks });
        }
    });
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
