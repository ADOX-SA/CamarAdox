let mediaStream;
let mediaRecorder;
let chunks = [];
let isRecording = false;

async function requestCameraPermission() {
  try {
    // Verificamos si el navegador admite la API de captura de medios (getUserMedia)
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      await navigator.mediaDevices.getUserMedia({ video: true });
      // initializeCamera();
      await populateCameraOptions();
      const containerSelector = document.getElementById(
        "cameraSelectorContainer"
      );
      containerSelector.className = "selector-container";
      const permissionbutton = document.getElementById(
        "requestPermissionButton"
      );
      permissionbutton.className = "btn-disable";
    } else {
      console.error("El navegador no admite la API de captura de medios.");
    }
  } catch (error) {
    console.error("Error al conectar a la cámara:", error);
  }
}

// Función para llenar el select con las cámaras disponibles
async function populateCameraOptions() {
  const devices = await navigator.mediaDevices.enumerateDevices();

  const videoInputDevices = devices.filter(
    (device) => device.kind === "videoinput"
  );

  // Limpiamos el selector de cámaras
  const cameraSelector = document.getElementById("cameraSelector");
  cameraSelector.innerHTML = "";

  // Agregamos las opciones de cámaras disponibles al selector
  videoInputDevices.forEach((device, index) => {
    const option = document.createElement("option");
    option.value = device.deviceId;
    option.text = `${device.label}`;
    cameraSelector.appendChild(option);
  });
}

// Evento para solicitar el acceso a la cámara cuando se carga la página
document.addEventListener("DOMContentLoaded", () => {
  const requestPermissionButton = document.getElementById(
    "requestPermissionButton"
  );
  requestPermissionButton.addEventListener("click", requestCameraPermission);

  const selectCameraButton = document.getElementById("selectCameraButton");
  selectCameraButton.addEventListener("click", async () => {
    const selectedCameraId = document.getElementById("cameraSelector").value;
    if (selectedCameraId) {
      await initializeCamera(selectedCameraId);
    }
  });

  const fullscreenButton = document.getElementById("fullscreen-button");
  fullscreenButton.addEventListener("click", toggleFullScreen);

  // Agregar el evento click al botón "Capturar imagen"
  const captureButton = document.getElementById("captureButton");
  captureButton.addEventListener("click", captureImage);

  // Agregar el evento click al botón "Grabar video"
  const recordButton = document.getElementById("recordButton");
  recordButton.addEventListener("click", toggleCapture);
});

// Función para inicializar la cámara con la cámara seleccionada
async function initializeCamera(cameraId) {
  try {
    console.log("Inicializando cámara...");
    const constraints = {
      video: cameraId ? { deviceId: { exact: cameraId } } : true,
    };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    const videoElement = document.getElementById("camera-view");
    const buttonsContainer = document.getElementById("buttonsContainer");
    buttonsContainer.className = "buttons-container";
    videoElement.srcObject = stream;
    videoElement.className = "camara";
    mediaStream = stream;

    const fullscreenButton = document.getElementById("fullscreen-button");
    fullscreenButton.className = "btn btn-secondary";
  } catch (error) {
    console.error("Error al conectar a la cámara:", error);
  }
}
// Función para capturar la imagen o iniciar/detener la grabación
function toggleCapture() {
  if (isRecording) {
    stopRecording();
  } else {
    startRecording();
  }
}

// Función para iniciar la grabación de video
function startRecording() {
  console.log("Iniciando grabación...");
  const video = document.getElementById("camera-view");

  if (mediaStream) {
    mediaRecorder = new MediaRecorder(mediaStream);
    chunks = [];

    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.onstop = handleRecordingStop;

    mediaRecorder.start();
    isRecording = true;
    const recordButton = document.getElementById("recordButton");
    recordButton.textContent = "Detener Grabación";
    recordButton.className = "btn btn-secondary";
  }
}

// Función para detener la grabación de video
function stopRecording() {
  console.log("Deteniendo grabación...");
  if (mediaRecorder && isRecording) {
    mediaRecorder.stop();
    isRecording = false;
    const recordButton = document.getElementById("recordButton");
    recordButton.textContent = "Grabar Video";
    recordButton.className = "btn btn-tertiary";
  }
}

// Función para manejar los datos disponibles durante la grabación
function handleDataAvailable(event) {
  chunks.push(event.data);
}

// Función para manejar el fin de la grabación
function handleRecordingStop() {
  const videoBlob = new Blob(chunks, { type: "video/webm" });
  chunks = [];

  // Creamos un enlace temporal y le asignamos el blob del video
  const link = document.createElement("a");
  link.download = getCurrentDateTime() + ".webm";
  link.href = URL.createObjectURL(videoBlob);

  // Simulamos el clic para descargar el video
  link.click();
}

// Función para capturar la imagen
function captureImage() {
  console.log("Capturando imagen...");
  const video = document.getElementById("camera-view");
  const canvas = document.getElementById("canvas");
  const context = canvas.getContext("2d");

  // Configuramos el tamaño del canvas para que coincida con el tamaño del video
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  // Dibujamos el video en el canvas
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Creamos un enlace temporal y le asignamos la imagen del canvas
  const link = document.createElement("a");
  link.download = getCurrentDateTime() + ".png";
  link.href = canvas
    .toDataURL("image/png")
    .replace("image/png", "image/octet-stream");

  // Simulamos el clic para descargar la imagen
  link.click();
}

// Función para obtener la fecha y hora actual en formato "yyyyMMdd-HHmmss"
function getCurrentDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  // return `${year}${month}${day}-${hours}${minutes}${seconds}`;
  return `${day}-${month}-${year}__${hours}-${minutes}-${seconds}hs`;
}

function toggleFullScreen() {
  const video = document.getElementById("camera-view");
  if (document.fullscreenElement) {
    // Si el video ya está en pantalla completa, salimos del modo de pantalla completa.
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      /* Firefox */
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      /* Chrome, Safari and Opera */
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      /* IE/Edge */
      document.msExitFullscreen();
    }
  } else {
    // Si el video no está en pantalla completa, lo ponemos en pantalla completa.
    if (video.requestFullscreen) {
      video.requestFullscreen();
    } else if (video.mozRequestFullScreen) {
      /* Firefox */
      video.mozRequestFullScreen();
    } else if (video.webkitRequestFullscreen) {
      /* Chrome, Safari and Opera */
      video.webkitRequestFullscreen();
    } else if (video.msRequestFullscreen) {
      /* IE/Edge */
      video.msRequestFullscreen();
    }
  }
}
