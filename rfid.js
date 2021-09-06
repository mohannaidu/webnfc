
// Add a global error event listener early on in the page load, to help ensure that browsers
// which don't support specific functionality still end up displaying a meaningful message.
window.addEventListener('error', function(error) {
    if (ChromeSamples && ChromeSamples.setStatus) {
        console.error(error);
        ChromeSamples.setStatus(error.message + ' (Your browser may not support this feature.)');
        error.preventDefault();
    }
});

var ChromeSamples = {
    log: function() {
        var line = Array.prototype.slice.call(arguments).map(function(argument) {
            return typeof argument === 'string' ? argument : JSON.stringify(argument);
        }).join(' ');

        document.querySelector('#log').textContent += line + '\n';
    },

    clearLog: function() {
        document.querySelector('#log').textContent = '';
    },

    setStatus: function(status) {
        document.querySelector('#status').textContent = status;
    },

    setContent: function(newContent) {
        var content = document.querySelector('#content');
        while(content.hasChildNodes()) {
            content.removeChild(content.lastChild);
        }
        content.appendChild(newContent);
    }
};

log = ChromeSamples.log;

if (!("NDEFReader" in window))
    ChromeSamples.setStatus(
        "Web NFC is not available.\n" +
        'Please make sure the "Experimental Web Platform features" flag is enabled on Android.'
    );


scanButton.addEventListener("click", async () => {
    log("User clicked scan button");

    try {
        const ndef = new NDEFReader();
        await ndef.scan();
        log("> Scan started");

        ndef.addEventListener("readingerror", () => {
            log("Argh! Cannot read data from the NFC tag. Try another one?");
        });

        ndef.addEventListener("reading", ({ message, serialNumber }) => {
            log(`> Serial Number: ${serialNumber}`);
            const record = message.records[0] ;
            const textDecoder = new TextDecoder(record.encoding);
            log(`> Message: (${textDecoder.decode(record.data)} (${record.lang})`);
            log(`> Records: (${message.records.length})`);
        });
    } catch (error) {
        log("Argh! " + error);
    }
});

writeButton.addEventListener("click", async () => {
    log("User clicked write button");

    try {
        const ndef = new NDEFReader();
        await ndef.write("Hello world!");
        log("> Message written");
    } catch (error) {
        log("Argh! " + error);
    }
});
