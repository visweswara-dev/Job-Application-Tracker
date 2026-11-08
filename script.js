
const addJobBtn = document.getElementById("add-job-btn");
const formSection = document.getElementById("job-form-section");
const jobForm = document.getElementById("job-form");
const cancelBtn = document.getElementById("cancel-btn");
const jobList = document.getElementById("job-list");
const searchInput = document.getElementById("search");
const filterStatus = document.getElementById("filter-status");

let applications = JSON.parse(localStorage.getItem("applications")) || [];
let editingJobId = null;

// Show application form
addJobBtn.addEventListener("click", () => {
    editingJobId = null;
    jobForm.reset();

    document.querySelector("#job-form button[type='submit']").textContent =
        "Add Application";

    formSection.hidden = false;
    formSection.scrollIntoView({ behavior: "smooth" });
});

// Cancel application form
cancelBtn.addEventListener("click", () => {
    jobForm.reset();
    editingJobId = null;
    formSection.hidden = true;
});

// Add or update application
jobForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const applicationData = {
        company: document.getElementById("company").value.trim(),
        role: document.getElementById("role").value.trim(),
        location: document.getElementById("location").value.trim(),
        status: document.getElementById("status").value,
        date: document.getElementById("date").value
    };

    if (editingJobId !== null) {
        applications = applications.map(job =>
            job.id === editingJobId
                ? { ...job, ...applicationData }
                : job
        );
    } else {
        applications.push({
            id: Date.now(),
            ...applicationData
        });
    }

    saveApplications();
    jobForm.reset();
    editingJobId = null;
    formSection.hidden = true;

    document.querySelector("#job-form button[type='submit']").textContent =
        "Add Application";

    renderApplications();
});

// Edit application
function editApplication(job) {
    editingJobId = job.id;

    document.getElementById("company").value = job.company;
    document.getElementById("role").value = job.role;
    document.getElementById("location").value = job.location;
    document.getElementById("status").value = job.status;
    document.getElementById("date").value = job.date;

    document.querySelector("#job-form button[type='submit']").textContent =
        "Save Changes";

    formSection.hidden = false;
    formSection.scrollIntoView({ behavior: "smooth" });
}

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

// Render applications
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

        const details = document.createElement("div");

        const heading = document.createElement("h3");
        heading.textContent = job.company;

        const description = document.createElement("p");
        description.textContent =
            `${job.role} • ${job.location || "Location not specified"} • ${job.date}`;

        details.append(heading, description);

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

        // Edit button
        const editButton = document.createElement("button");
        editButton.className = "edit-btn";
        editButton.textContent = "Edit";

        editButton.addEventListener("click", () => {
            editApplication(job);
        });

        // Delete button
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

        actions.append(statusSelect, editButton, deleteButton);

        card.append(details, actions);
        jobList.appendChild(card);
    });

    updateStatistics();
}

// Search and filter
searchInput.addEventListener("input", renderApplications);
filterStatus.addEventListener("change", renderApplications);

// Initial dashboard loading
renderApplications();
