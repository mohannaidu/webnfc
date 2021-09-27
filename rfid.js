
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

const ndef = new NDEFReader();

async function startScanning() {
    log("Awaiting scan");
    await ndef.scan();
    log("Onreading scan");
    ndef.onreading = event => {
        /* handle NDEF messages */
        const message = event.message;
        for (const record of message.records) {
            log("Record type:  " + record.recordType);
            log("MIME type:    " + record.mediaType);
            log("Record id:    " + record.id);
            log("Record length: " + record.length);
            switch (record.recordType) {
                case "text":
                    // TODO: Read text record with record data, lang, and encoding.
                    const textDecoder = new TextDecoder(record.encoding);
                    log(`Text: ${textDecoder.decode(record.data)} (${record.lang})`);
                    break;
                case "url":
                    // TODO: Read URL record with record data.
                    break;
                default:
                    log(`Entering default recordtype`);
                    const textDecoder2 = new TextDecoder(record.encoding);
                    log(`Text: ${textDecoder2.decode(record.data)} `);
                    break;

                // TODO: Handle other records with record data.
            }
        }
    };
}

// const nfcPermissionStatus = await navigator.permissions.query({ name: "nfc" });
// if (nfcPermissionStatus.state === "granted") {
//     // NFC access was previously granted, so we can start NFC scanning now.
//     await startScanning();
// }

scanButton.addEventListener("click", async () => {
    log("User clicked scan button");
    startScanning();

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
