
const uploadButton = document.getElementById("uploadButton");
const materialFile = document.getElementById("materialFile");
const materialSubject = document.getElementById("materialSubject");
const materialsList = document.getElementById("materialsList");

// Create storage for uploaded files
const materialDB = indexedDB.open("StudentMaterialsDB", 1);

materialDB.onupgradeneeded = function (event) {
    const db = event.target.result;

    if (!db.objectStoreNames.contains("materials")) {
        db.createObjectStore("materials", {
            keyPath: "id",
            autoIncrement: true
        });
    }
};

// Display saved materials
materialDB.onsuccess = function (event) {
    const db = event.target.result;
    showMaterials(db);
};

function showMaterials(db) {
    const transaction = db.transaction("materials", "readonly");
    const store = transaction.objectStore("materials");

    store.getAll().onsuccess = function (event) {
        materialsList.replaceChildren();

        event.target.result.forEach(function (item) {
            const box = document.createElement("div");
            const title = document.createElement("p");
            const link = document.createElement("a");

            title.textContent =
                item.subject + " - " + item.name;

            const fileURL = URL.createObjectURL(item.file);

            link.href = fileURL;
            link.download = item.name;
            link.textContent = "Download Material";

            box.append(title, link);
            materialsList.appendChild(box);
        });
    };
}

// Upload and save the selected file
uploadButton.addEventListener("click", function () {
    const file = materialFile.files[0];
    const subject = materialSubject.value.trim();

    if (!subject || !file) {
        alert("Please enter a subject and choose a file.");
        return;
    }

    materialDB.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction(
            "materials", "readwrite"
        );

        transaction.objectStore("materials").add({
            subject: subject,
            name: file.name,
            file: file,
            uploadedAt: new Date().toISOString()
        });

        transaction.oncomplete = function () {
            alert("Material saved successfully!");
            materialSubject.value = "";
            materialFile.value = "";
            showMaterials(db);
        };

        transaction.onerror = function () {
            alert("Could not save the file. Please try again.");
        };
    };
});
