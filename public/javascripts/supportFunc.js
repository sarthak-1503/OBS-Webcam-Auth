let capturedImage;

document.addEventListener("keyup", () => {
  setTimeout(() => {
    capturedImage = document.getElementById("capturedImage");
    Promise.all([
      faceapi.nets.faceRecognitionNet.loadFromUri("/apimodels"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/apimodels"),
      faceapi.nets.ssdMobilenetv1.loadFromUri("/apimodels"),
    ]).then(start);  
  }, 80);
  
});

async function start() {
  const orig = document.getElementById("original");
  const container = document.createElement("div");
  container.style.position = "relative";
  document.body.append(container);
  const labeledFaceDescriptors = await loadLabeledImages();
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
  let image;
  let canvas;
  document.body.append('Loaded')

  console.log(capturedImage)

  capturedImage.onchange = async () => {
    console.log('hello')
    image = await faceapi.bufferToImage(capturedImage.files[0])
    container.append(image);
    canvas = faceapi.createCanvasFromMedia(image);
    container.append(canvas);
    orig.append(container);
    const displaySize = { width: image.width, height: image.height };
    faceapi.matchDimensions(canvas, displaySize);
    const detections = await faceapi
      .detectAllFaces(image)
      .withFaceLandmarks()
      .withFaceDescriptors();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    const results = resizedDetections.map((d) =>
      faceMatcher.findBestMatch(d.descriptor)
    );
    let finalResult;
    results.forEach((result, i) => {
      const box = resizedDetections[i].detection.box;
      const drawBox = new faceapi.draw.DrawBox(box, {
        label: result.toString(),
      });
      finalResult = result;
      drawBox.draw(canvas);
    });

    let url;
    let success;
    console.log(finalResult._distance);

    if (finalResult._distance < 0.6) {
      url = "/";
      success = () => {
        alert("Face matched! Login successful.");
        setTimeout(() => {
          window.location.replace("/");
        }, 1000);
      };
    } else {
      url = "/auth/login";
      success = () => {
        alert("Face is not matching! Login again.");
        setTimeout(() => {
          window.location.replace("/auth/login");
        }, 1000);
      };

    }

    $.ajax({
      url: window.location.href,
      type: "POST",
      data: {
        conclusion: finalResult._distance < 0.6,
      },
      dataType: "json",
      success: success(),
    });
  };
}

function loadLabeledImages() {
  let labels = [document.getElementById("actual").name];

  return Promise.all(
    labels.map(async (label) => {
      const descriptions = [];
      let canvas = faceapi.createCanvasFromMedia(
        document.getElementById("actual")
      );
      const detections = await faceapi
        .detectSingleFace(canvas)
        .withFaceLandmarks()
        .withFaceDescriptor();
      descriptions.push(detections.descriptor);

      return new faceapi.LabeledFaceDescriptors(label, descriptions);
    })
  );
}
