const noteForm = document.getElementById("noteForm");
const subjectInput = document.getElementById("subject");
const topicInput = document.getElementById("topic");
const noteInput = document.getElementById("note");
const notesList = document.getElementById("notesList");
const searchInput = document.getElementById("search");
const noteCount = document.getElementById("noteCount");
const formTitle = document.getElementById("formTitle");
const saveButton = document.getElementById("saveButton");
const cancelButton = document.getElementById("cancelButton");

let notes = [];

try {
    notes = JSON.parse(localStorage.getItem("studentNotes")) || [];
    if (!Array.isArray(notes)) notes = [];
} catch {
    notes = [];
}

let editingId = null;

function saveNotes() {
    localStorage.setItem("studentNotes", JSON.stringify(notes));
}

function displayNotes() {
    notesList.replaceChildren();

    const searchText = searchInput.value.toLowerCase().trim();

    const filteredNotes = notes.filter(function(item) {
        return item.subject.toLowerCase().includes(searchText) ||
               item.topic.toLowerCase().includes(searchText) ||
               item.note.toLowerCase().includes(searchText);
    });

    noteCount.textContent =
        "Total notes: " + notes.length +
        " | Showing: " + filteredNotes.length;

    if (filteredNotes.length === 0) {
        const message = document.createElement("p");
        message.className = "empty-message";
        message.textContent = notes.length === 0
            ? "No notes yet. Add your first note above!"
            : "No matching notes found.";
        notesList.appendChild(message);
        return;
    }

    filteredNotes.forEach(function(item) {
        const card = document.createElement("div");
        card.className = "note-card";

        const heading = document.createElement("h3");
        heading.textContent = item.subject;

        const topic = document.createElement("h4");
        topic.textContent = "Topic: " + item.topic;

        const content = document.createElement("p");
        content.textContent = item.note;

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.addEventListener("click", function() {
            editNote(item.id);
        });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete";
        deleteButton.addEventListener("click", function() {
            deleteNote(item.id);
        });

        card.append(heading, topic, content, editButton, deleteButton);
        notesList.appendChild(card);
    });
}

noteForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const subject = subjectInput.value.trim();
    const topic = topicInput.value.trim();
    const note = noteInput.value.trim();

    if (!subject || !topic || !note) {
        alert("Please fill in all three fields.");
        return;
    }

    if (editingId !== null) {
        const item = notes.find(function(n) {
            return n.id === editingId;
        });

        if (item) {
            item.subject = subject;
            item.topic = topic;
            item.note = note;
        }
    } else {
        notes.push({
            id: Date.now().toString() + Math.random().toString(36).slice(2),
            subject: subject,
            topic: topic,
            note: note
        });
    }

    saveNotes();
    noteForm.reset();
    resetEditMode();
    displayNotes();
});

function editNote(id) {
    const item = notes.find(function(n) {
        return n.id === id;
    });

    if (!item) return;

    editingId = id;
    subjectInput.value = item.subject;
    topicInput.value = item.topic;
    noteInput.value = item.note;

    formTitle.textContent = "Edit Your Note";
    saveButton.textContent = "Update Note";
    cancelButton.hidden = false;

    document.querySelector(".form-box").scrollIntoView({
        behavior: "smooth"
    });

    subjectInput.focus();
}

function deleteNote(id) {
    if (!confirm("Are you sure you want to delete this note?")) {
        return;
    }

    notes = notes.filter(function(item) {
        return item.id !== id;
    });

    if (editingId === id) {
        noteForm.reset();
        resetEditMode();
    }

    saveNotes();
    displayNotes();
}

function resetEditMode() {
    editingId = null;
    formTitle.textContent = "Add Your Note";
    saveButton.textContent = "Add Note";
    cancelButton.hidden = true;
}

cancelButton.addEventListener("click", function() {
    noteForm.reset();
    resetEditMode();
});

searchInput.addEventListener("input", displayNotes);

displayNotes();