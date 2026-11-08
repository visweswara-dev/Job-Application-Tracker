const addJobBtn = document.getElementById("add-job-btn");
const formSection = document.getElementById("job-form-section");
const jobForm = document.getElementById("job-form");
const cancelBtn = document.getElementById("cancel-btn");
const jobList = document.getElementById("job-list");
const searchInput = document.getElementById("search");
const filterStatus = document.getElementById("filter-status");

let applications = JSON.parse(localStorage.getItem("applications")) || [];

// Show application form
addJobBtn.addEventListener("click", () => {
    formSection.hidden = false;
    formSection.scrollIntoView({ behavior: "smooth" });
});

// Cancel application form
cancelBtn.addEventListener("click", () => {
    jobForm.reset();
    formSection.hidden = true;
});

// Add new application
jobForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const application = {
        id: Date.now(),
        company: document.getElementById("company").value.trim(),
        role: document.getElementById("role").value.trim(),
        location: document.getElementById("location").value.trim(),
        status: document.getElementById("status").value,
        date: document.getElementById("date").value
    };

    applications.push(application);

    saveApplications();
    jobForm.reset();
    formSection.hidden = true;
    renderApplications();
});

// Save applications in browser storage
function saveApplications() {
    localStorage.setItem("applications", JSON.stringify(applications));
}

// Update dashboard statistics
function updateStatistics() {
    document.getElementById("total-count").textContent =
        applications.length;

    document.getElementById("interview-count").textContent =
        applications.filter(job => job.status === "Interview").length;

    document.getElementById("offer-count").textContent =
        applications.filter(job => job.status === "Offer").length;

    document.getElementById("rejected-count").textContent =
        applications.filter(job => job.status === "Rejected").length;
}

// Render applications on the dashboard
function renderApplications() {
    const searchText = searchInput.value.toLowerCase();
    const selectedStatus = filterStatus.value;

    const filteredApplications = applications.filter(job => {
        const matchesSearch =
            job.company.toLowerCase().includes(searchText) ||
            job.role.toLowerCase().includes(searchText);

        const matchesStatus =
            selectedStatus === "All" ||
            job.status === selectedStatus;

        return matchesSearch && matchesStatus;
    });

    jobList.innerHTML = "";

    if (filteredApplications.length === 0) {
        jobList.innerHTML =
            '<p class="empty-message">No matching applications found.</p>';
    }

    filteredApplications.forEach(job => {
        const card = document.createElement("div");
        card.className = "job-card";

        // Application details
        const details = document.createElement("div");

        const heading = document.createElement("h3");
        heading.textContent = job.company;

        const description = document.createElement("p");
        description.textContent =
            `${job.role} • ${job.location || "Location not specified"} • ${job.date}`;

        details.append(heading, description);

        // Status editing and delete actions
        const actions = document.createElement("div");
        actions.className = "job-details";

        const statusSelect = document.createElement("select");

        ["Applied", "Interview", "Offer", "Rejected"].forEach(status => {
            const option = document.createElement("option");
            option.value = status;
            option.textContent = status;
            statusSelect.appendChild(option);
        });

        statusSelect.value = job.status;
        statusSelect.className = `status status-${job.status}`;

        statusSelect.addEventListener("change", () => {
            job.status = statusSelect.value;
            saveApplications();
            renderApplications();
        });

        // Delete application
        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", () => {
            applications = applications.filter(
                item => item.id !== job.id
            );

            saveApplications();
            renderApplications();
        });

        actions.append(statusSelect, deleteButton);

        card.append(details, actions);
        jobList.appendChild(card);
    });

    updateStatistics();
}

// Search and filter functionality
searchInput.addEventListener("input", renderApplications);
filterStatus.addEventListener("change", renderApplications);

// Initial dashboard loading
renderApplications();
