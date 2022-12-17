
var isAdvancedUpload = (function () {
	var div = document.createElement("div");
	return (
		("draggable" in div || ("ondragstart" in div && "ondrop" in div)) &&
		"FormData" in window &&
		"FileReader" in window
	);
})();

let draggableFileArea = document.querySelector(".drag-file-area");
let browseFileText = document.querySelector(".browse-files");
let uploadIcon = document.querySelector(".upload-icon");
let dragDropText = document.querySelector(".dynamic-message");
let fileInput = document.querySelector(".default-file-input");
let cannotUploadMessage = document.querySelector(
	".cannot-upload-message"
);
let cancelAlertButton = document.querySelector(".cancel-alert-button");
let uploadedFile = document.querySelector(".file-block");
let fileName = document.querySelector(".file-name");
let fileSize = document.querySelector(".file-size");
let removeFileButton = document.querySelector(".remove-file-icon");
let uploadButton = document.querySelector(".upload-button");
let uploadDiv = document.getElementById("upload-div");
let mainDiv = document.getElementById("main-div");
let fileFlag = 0;
function onClickInputTag(){
	fileInput.value = null;
}
function onChangeInputTag(e){
	console.log(" > " + fileInput.value);
	uploadIcon.innerHTML = "check_circle";
	dragDropText.innerHTML = "File Dropped Successfully!";
	document.querySelector(
		".label"
	).innerHTML = `drag & drop or <span class="browse-files"> <input type="file" accept="video/*" id="input-tag" class="default-file-input" style=""/> <span class="browse-files-text" style="top: 0;"> browse file</span></span>`;
	uploadButton.innerHTML = `Upload`;
	fileName.innerHTML = fileInput.files[0].name;
	fileSize.innerHTML =
		(fileInput.files[0].size / 1024).toFixed(1) + " KB";
	uploadedFile.style.cssText = "display: flex;";
	fileFlag = 0;
}
fileInput.addEventListener("click", () => {
	onClickInputTag();
	console.log('fileinput clicked');
	// console.log(fileInput.value);
});

fileInput.addEventListener("change", (e) => {
	onChangeInputTag(e);
});

uploadButton.addEventListener("click", () => {
	mainDiv.style.display = "block";
	uploadDiv.style.display = "none";
});

cancelAlertButton.addEventListener("click", () => {
	cannotUploadMessage.style.cssText = "display: none;";
});

if (isAdvancedUpload) {
	[
		"drag",
		"dragstart",
		"dragend",
		"dragover",
		"dragenter",
		"dragleave",
		"drop",
	].forEach((evt) =>
		draggableFileArea.addEventListener(evt, (e) => {
			e.preventDefault();
			e.stopPropagation();
		})
	);

	["dragover", "dragenter"].forEach((evt) => {
		draggableFileArea.addEventListener(evt, (e) => {
			e.preventDefault();
			e.stopPropagation();
			uploadIcon.innerHTML = "file_download";
			dragDropText.innerHTML = "Drop your file here!";
		});
	});

	draggableFileArea.addEventListener("drop", (e) => {
		uploadIcon.innerHTML = "check_circle";
		dragDropText.innerHTML = "File Dropped Successfully!";
		document.querySelector(
			".label"
		).innerHTML = `drag & drop or <span class="browse-files"> <input type="file" accept="video/*" id="input-tag" class="default-file-input" style=""/> <span class="browse-files-text" style="top: -23px;"> browse file</span> </span>`;
		uploadButton.innerHTML = `Upload`;

		let files = e.dataTransfer.files;
		fileInput.files = files;
		console.log('drop');
		readVideo(files);
		console.log(files[0].name + " " + files[0].size);
		console.log(document.querySelector(".default-file-input").value);
		fileName.innerHTML = files[0].name;
		fileSize.innerHTML = (files[0].size / 1024).toFixed(1) + " KB";
		uploadedFile.style.cssText = "display: flex;";
		fileFlag = 0;
	});
}

removeFileButton.addEventListener("click", () => {
	uploadedFile.style.cssText = "display: none;";
	fileInput.value = "";
	uploadIcon.innerHTML = "file_upload";
	dragDropText.innerHTML = "Drag & drop any file here";
	document.querySelector(
		".label"
	).innerHTML = `or <span class="browse-files"> <input type="file" accept="video/*" id="input-tag" class="default-file-input"/> <span class="browse-files-text">browse file</span> <span>from device</span> </span>`;
	uploadButton.innerHTML = `Upload`;
});
