window.addEventListener("message", function(event) {
    if (event.source === window && event.data.type && event.data.type === "EXECUTE_ACTION") {
        const { functionName, args } = event.data.payload;

        if (typeof window[functionName] === 'function') {
            console.log(`Executing ${functionName} with args:`, args);
            window[functionName](document.form1, ...args);
        } else {
            console.error(`Helper Error: Function ${functionName} not found on page.`);
        }
    }
}, false);