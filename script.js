const display = document.getElementById('display');
const binaryOutput = document.getElementById('binaryOutput');

// typewriter sound
const audioElement = new Audio('typewriter.mp3');
audioElement.preload = 'auto';
function playAudio() {
    try {
        audioElement.currentTime = 0;
        audioElement.play();
    } catch (e) {
        // ignore playback errors
    }
}

function appendToDisplay(ch) {
    // digits
    if (/^[0-9]$/.test(ch)) {
        display.value = (display.value || '') + ch;
        display.focus();
        playAudio();
        return;
    }

    // operators: + - * /
    if (/^[+\-*/]$/.test(ch)) {
        const v = display.value || '';
        // allow leading minus for negative numbers only
        if (v === '' && ch !== '-') return;

        // avoid consecutive operators: replace last operator with new one
        if (/[+\-*/]\s*$/.test(v)) {
            display.value = v.replace(/[+\-*/]\s*$/, ch);
        } else {
            display.value = v + ch;
        }
        display.focus();
        playAudio();
        return;
    }

    // ignore other characters
}

function allClear() {
    document.getElementById("display").value = ""; 
    audioElement.currentTime = 0;
    audioElement.play();
    lastWasResult = false; // Reset flag on clear
}

// Clear the last entry (backspace)
function clearEntry() {
    const display = document.getElementById("display");
    display.value = display.value.slice(0, -1);
    audioElement.currentTime = 0;
    audioElement.play();
    lastWasResult = false; // Reset flag on clear
}

function convertToBinary() {
    const expr = (display.value || '').trim();
    if (expr === '') {
        binaryOutput.value = '';
        return;
    }

    if (!/^[0-9+\-*/()\s]+$/.test(expr)) {
        binaryOutput.value = 'Invalid characters';
        return;
    }

    try {
        const exprWithBigInt = expr.replace(/\d+/g, (m) => `${m}n`);
        const fn = new Function('"use strict"; return (' + exprWithBigInt + ')');
        const result = fn();

        if (typeof result !== 'bigint') {
            binaryOutput.value = 'Error';
            return;
        }

        if (result < 0n) {
            binaryOutput.value = '-' + ((-result).toString(2));
        } else {
            binaryOutput.value = result.toString(2);
        }
    } catch (e) {
        binaryOutput.value = 'Error';
    }
}

// async function pasteClipboard() {
//     try {
//         const text = await navigator.clipboard.readText();
//         if (text) {
//             const m = text.trim().match(/^[0-9+\-*/()\s]+/);
//             if (m) {
//                 display.value = m[0];
//                 playAudio();
//             }
//         }
//     } catch {
//         // ignore
//     }
//     display.focus();
// }

document.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') {
        appendToDisplay(e.key);
        e.preventDefault();
        return;
    }

    if (['+', '-', '*', '/'].includes(e.key)) {
        appendToDisplay(e.key);
        e.preventDefault();
        return;
    }

    if (e.key === 'Backspace') {
        clearEntry();
        e.preventDefault();
        return;
    }
    if (e.key === 'Enter') {
        convertToBinary();
        e.preventDefault();
        return;
    }
});

display.focus();