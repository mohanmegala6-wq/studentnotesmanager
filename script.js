
const uploadButton = document.getElementById("uploadButton");
const materialFile = document.getElementById("materialFile");
const materialSubject = document.getElementById("materialSubject");
const materialsList = document.getElementById("materialsList");

let db;

// Open database
const request = indexedDB.open("StudentMaterialsDB", 1);

request.onupgradeneeded = function (event) {
    const database = event.target.result;

    if (!database.objectStoreNames.contains("materials")) {
        database.createObjectStore("materials", {
            keyPath: "id",
            autoIncrement: true
        });
    }
};

request.onsuccess = function (event) {
    db = event.target.result;
    showMaterials();
};

request.onerror = function () {
    alert("Could not open material storage.");
};

// Upload material
uploadButton.addEventListener("click", function () {
    const subject = materialSubject.value.trim();
    const file = materialFile.files[0];

    if (!subject || !file) {
        alert("Please enter a subject and choose a file.");
        return;
    }

    if (!db) {
        alert("Storage is loading. Please try again.");
        return;
    }

    const transaction = db.transaction("materials", "readwrite");

    transaction.objectStore("materials").add({
        subject: subject,
        name: file.name,
        file: file,
        uploadedAt: new Date().toISOString()
    });

    transaction.oncomplete = function () {
        alert("Material uploaded successfully!");
        materialSubject.value = "";
        materialFile.value = "";
        showMaterials();
    };

    transaction.onerror = function () {
        alert("Upload failed. Please try again.");
    };
});

// Display materials with Delete button
function showMaterials() {
    if (!db) return;

    const transaction = db.transaction("materials", "readonly");
    const store = transaction.objectStore("materials");

    store.getAll().onsuccess = function (event) {
        materialsList.replaceChildren();

        const materials = event.target.result;

        if (materials.length === 0) {
            materialsList.textContent = "No materials uploaded yet.";
            return;
        }

        materials.forEach(function (item) {
            const box = document.createElement("div");
            const title = document.createElement("p");
            const link = document.createElement("a");
            const deleteButton = document.createElement("button");

            title.textContent = item.subject + " - " + item.name;

            link.href = URL.createObjectURL(item.file);
            link.download = item.name;
            link.textContent = "Open / Download";

            deleteButton.textContent = "Delete";
            deleteButton.type = "button";

            deleteButton.addEventListener("click", function () {
                const confirmed = confirm(
                    "Are you sure you want to delete " + item.name + "?"
                );

                if (!confirmed) return;

                const deleteTransaction = db.transaction(
                    "materials",
                    "readwrite"
                );

                deleteTransaction.objectStore("materials").delete(item.id);

                deleteTransaction.oncomplete = function () {
                    showMaterials();
                };

                deleteTransaction.onerror = function () {
                    alert("Could not delete this material.");
                };
            });

            box.append(title, link, document.createTextNode(" "), deleteButton);
            materialsList.appendChild(box);
        });
    };
}
