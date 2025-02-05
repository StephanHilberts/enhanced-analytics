console.log("Script loaded");

// Helper function to check for 'marksmen_uids' in dataLayer
function waitForMarksmenUids(callback, timeout = 5000, interval = 200) {
    const startTime = Date.now();

    const checkDataLayer = () => {
        if (typeof dataLayer !== "undefined" && Array.isArray(dataLayer)) {
            const marksmenData = dataLayer.find((item) => item.event === "marksmen_uids");

            if (marksmenData) {
                console.log("'marksmen_uids' event found in dataLayer:", marksmenData);
                callback(marksmenData);
                return;
            }
        }

        if (Date.now() - startTime < timeout) {
            setTimeout(checkDataLayer, interval);
        } else {
            console.log("'marksmen_uids' event not found in dataLayer within timeout.");
            callback(null);
        }
    };

    checkDataLayer();
}

// Listen for clicks on the entire page
document.addEventListener("click", function (event) {
    console.log("Click detected:", event.target);

    try {
        // Check if a submit button is clicked
        if (event.target.type === "submit") {
            console.log("Submit button clicked");

            // Prevent the form from submitting automatically
            event.preventDefault();

            var form = event.target.closest("form");
            console.log("Form found:", form);

            if (!form) {
                console.log("No form associated with this button");
                return;
            }

            // Look for the email input
            var emailInput = form.querySelector('input[type="email"]');
            if (!emailInput) {
                console.log("No email input found in the form");
                return;
            }

            var email = emailInput.value.trim().toLowerCase();
            console.log("Email found:", email);

            // Only proceed if the email is not empty
            if (email) {
                // Hash the email
                var hashedEmail = sha256(email);
                console.log("Hashed email:", hashedEmail);

                // Wait for the 'marksmen_uids' event in dataLayer
                waitForMarksmenUids((marksmenData) => {
                    if (marksmenData) {
                        // Extract values from the dataLayer event
                        var marksmen_uid_c = marksmenData.marksmen_uid_c || null;
                        var marksmen_uid_s = marksmenData.marksmen_uid_s || null;
                        var marksmen_uid_p = marksmenData.marksmen_uid_p || null;

                        console.log("marksmen_uid_c:", marksmen_uid_c);
                        console.log("marksmen_uid_s:", marksmen_uid_s);
                        console.log("marksmen_uid_p:", marksmen_uid_p);

                        // Prepare the payload
                        var payload = {
                            marksmen_uid_e: hashedEmail,
                            marksmen_uid_c: marksmen_uid_c,
                            marksmen_uid_s: marksmen_uid_s,
                            marksmen_uid_p: marksmen_uid_p,
                        };

                        // Send the data to the webhook
                        fetch("https://webhook.site/b8323ba4-cd8a-4025-a501-581791c4983b", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(payload),
                        })
                            .then((response) => {
                                if (response.ok) {
                                    console.log("Data sent successfully:", payload);
                                } else {
                                    console.error("Failed to send data");
                                }
                            })
                            .catch((error) => console.error("Error sending data:", error));
                    } else {
                        console.log("No 'marksmen_uids' event found in dataLayer. Data not sent.");
                    }
                });
            } else {
                console.log("Email input is empty, no data sent.");
            }
        }
    } catch (e) {
        console.error("Error processing click event:", e);
    }
});