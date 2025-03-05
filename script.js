document.addEventListener("DOMContentLoaded", function () {
    const investmentAmount = document.getElementById("investmentAmount");
    const interestType = document.getElementById("interestType");
    const rateInput = document.getElementById("rate");
    const investmentDateInput = document.getElementById("investmentDateInput"); // Date picker
    const daysRemaining = document.getElementById("daysRemaining");
    const expectedIncome = document.getElementById("expectedIncome");
    const paymentDate = document.getElementById("paymentDate");

    // Constants
    const DAYS_IN_YEAR = 365;

    // Interest rates based on selection
    const rates = {
        "Monthly": 0.1925,
        "Quarterly": 0.195,
        "Semi-Annually": 0.1975,
        "Upfront": 0.19,
        "Backend": 0.2
    };

    // Helper function to format date as dd-MMM-yyyy
    function formatDate(date) {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        let day = String(date.getDate()).padStart(2, '0');
        let month = months[date.getMonth()]; // Get abbreviated month name
        let year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }

    function updateRate() {
        if (!interestType.value) {
            // If no interest type is selected, show a placeholder message
            rateInput.value = "Please select an interest type";
            daysRemaining.value = "";
            expectedIncome.value = "";
            paymentDate.value = "";
            return;
        }

        // Update rate based on the selected interest type
        rateInput.value = (rates[interestType.value] * 100).toFixed(2) + "%";
        updateDaysRemaining();
    }

    function updateDaysRemaining() {
        if (!interestType.value || !investmentDateInput.value || isNaN(new Date(investmentDateInput.value).getTime())) {
            // If no interest type or invalid date is selected, clear dependent fields
            daysRemaining.value = "";
            expectedIncome.value = "";
            paymentDate.value = "";
            return;
        }

        let startDate = new Date(investmentDateInput.value);
        let endDate;
        let currentYear = startDate.getFullYear();
        let currentMonth = startDate.getMonth(); // Months are 0-indexed

        // Monthly - End of the same month
        if (interestType.value === "Monthly") {
            endDate = new Date(currentYear, currentMonth + 1, 0); // Last day of the current month
        } 
        
        // Quarterly - Ends in April, July, October, or January
        else if (interestType.value === "Quarterly") {
            let quarterMonths = [3, 6, 9, 0]; // 0 represents January of the next year
            let nextQuarter = quarterMonths.find(m => m > currentMonth) || 0;
            let year = nextQuarter === 0 ? currentYear + 1 : currentYear;
            endDate = new Date(year, nextQuarter + 1, 0); // Last day of the quarter month
        } 
        
        // Semi-Annually - Ends in August or January
        else if (interestType.value === "Semi-Annually") {
            let semiAnnualMonth = currentMonth < 7 ? 7 : 0; // 0 represents January of the next year
            let year = semiAnnualMonth === 0 ? currentYear + 1 : currentYear;
            endDate = new Date(year, semiAnnualMonth + 1, 0); // Last day of August or January
        } 
        
        // Upfront & Backend - Always ends January 31 of the next year
        else if (interestType.value === "Upfront" || interestType.value === "Backend") {
            endDate = new Date(currentYear + 1, 0, 31); // January 31 of the next year
        }

        // Calculate the number of days remaining
        let timeDiff = endDate - startDate;
        let dayCount = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1; // Add 1 to include the current day
        daysRemaining.value = dayCount;

        updateExpectedIncome();
        updatePaymentDate(endDate);
    }

    function updateExpectedIncome() {
        if (!interestType.value || !investmentDateInput.value) {
            // If no interest type or date is selected, clear the expected income field
            expectedIncome.value = "";
            return;
        }

        try {
            let principal = parseFloat(investmentAmount.value.replace(/,/g, '')) || 0; // Remove commas for calculation
            let rate = rates[interestType.value] || 0;
            let income = principal * rate * (parseInt(daysRemaining.value) / DAYS_IN_YEAR);
            expectedIncome.value = income.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        } catch (error) {
            console.error("Error calculating expected income:", error);
            expectedIncome.value = "Error";
        }
    }

    function updatePaymentDate(date) {
        if (!interestType.value) {
            // If no interest type is selected, clear the payment date field
            paymentDate.value = "";
            return;
        }

        // Format date as dd-MMM-yyyy
        paymentDate.value = formatDate(date);
    }

    function formatInvestmentAmount() {
        // Format the investment amount with commas
        let value = investmentAmount.value.replace(/,/g, ''); // Remove existing commas
        if (!isNaN(value)) {
            investmentAmount.value = parseFloat(value).toLocaleString(); // Add commas back
        }
    }

    // Event listeners
    interestType.addEventListener("change", updateRate);
    investmentDateInput.addEventListener("change", updateDaysRemaining);

    // Format investment amount only when the user leaves the input field
    investmentAmount.addEventListener("blur", () => {
        formatInvestmentAmount();
        updateExpectedIncome();
    });

    // Allow real-time updates for calculations without interfering with input
    investmentAmount.addEventListener("input", () => {
        updateExpectedIncome();
    });

    // Initialize
    updateRate();
});