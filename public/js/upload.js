let FILE = null;
let counter = 0;
const overlay = document.getElementById("overlay");
const imageContent = document.getElementById("image-content");
const imagePreview = document.getElementById("image-preview");
const fileInput = document.getElementById("file-input");
const uploadBtn = document.getElementById("upload-btn");
document.getElementById("select-btn").onclick = () => fileInput.click();
uploadBtn.onclick = () => uploadFile(FILE);

const addImage = (file) => {
  const resp = validateImage(file);
  if (!resp.success) {
    Swal.fire({
      text: resp.message,
      icon: "info",
    });
  } else {
    imageContent.classList.add("has-image");
    const objectURL = URL.createObjectURL(file);
    imagePreview.src = objectURL;
    imagePreview.alt = file.name;
    FILE = file;
  }
};

const validateImage = (file) => {
  const response = {
    success: true,
    message: "",
  };
  //check file exist
  if (!file) {
    response.success = false;
    response.message = "Seleccione una imagen por favor.";
    return response;
  }
  // check file type
  if (
    !["image/jpeg", "image/gif", "image/png", "image/svg+xml"].includes(
      file.type
    )
  ) {
    response.success = false;
    response.message = "Solo se admiten formatos de tipo imagen.";
    return response;
  }
  // check file size (< 3MB)
  if (file.size > 3 * 1024 * 1024) {
    response.success = false;
    response.message = "La imagen debe pesar menos de 3MB.";
    return response;
  }
  return response;
};

fileInput.onchange = (e) => {
  addImage(e.target.files[0]);
};
// handle drag and drop file
const hasFiles = ({ dataTransfer: { types = [] } }) =>
  types.indexOf("Files") > -1;
// reset counter and append file to gallery when file is dropped
function dropHandler(ev) {
  ev.preventDefault();
  overlay.classList.remove("draggedover");
  const file = ev.dataTransfer.files[0];
  counter = 0;
  addImage(file);
}
// only react to actual files being dragged
function dragEnterHandler(e) {
  e.preventDefault();
  if (!hasFiles(e)) {
    return;
  }
  ++counter && overlay.classList.add("draggedover");
}

function dragLeaveHandler(e) {
  1 > --counter && overlay.classList.remove("draggedover");
}

function dragOverHandler(e) {
  if (hasFiles(e)) {
    e.preventDefault();
  }
}

const uploadFile = (file) => {
  const resp = validateImage(file);
  if (!resp.success) {
    Swal.fire({
      text: resp.message,
      icon: "info",
    });
  } else {
    uploadBtn.disabled = true;
    // add file to FormData object
    const fd = new FormData();
    fd.append("file", file);
    // send `POST` request
    fetch("/auth/upload", {
      method: "POST",
      body: fd,
    })
      .then((res) => res.json())
      .then((json) => {
        Swal.fire({
          title: json.success ? "Todo correcto" : "Algo salió mal",
          text: json.message,
          icon: json.success ? "success" : "error",
        });
        uploadBtn.disabled = false;
      })
      .catch((err) => {
        console.log(err);
        Swal.fire({
          title: "Ocurrió un error",
          text: "Por favor vuelve a intentarlo.",
          icon: "error",
          confirmButtonText: "Entendido",
        });
        uploadBtn.disabled = false;
      });
  }
};
