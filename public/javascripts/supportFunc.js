const capturedImage = document.getElementById('capturedImage')

    Promise.all([
      faceapi.nets.faceRecognitionNet.loadFromUri('/apimodels'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/apimodels'),
      faceapi.nets.ssdMobilenetv1.loadFromUri('/apimodels')
    ]).then(start)

    async function start() {
      const container = document.createElement('div')
      container.style.position = 'relative'
      document.body.append(container)
      const labeledFaceDescriptors = await loadLabeledImages()
      const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)
      let image
      let canvas

      
     
      capturedImage.addEventListener('change', async () => {
        
        image = await faceapi.bufferToImage(capturedImage.files[0])
        // image = capturedImage;
        container.append(image)
        document.getElementById('proceed').innerHTML = "<button id='proceed' type='submit'>Proceed</button>"
        canvas = faceapi.createCanvasFromMedia(image)
        container.append(canvas)
        const displaySize = { width: image.width, height: image.height }
        faceapi.matchDimensions(canvas, displaySize)
        const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
        const resizedDetections = faceapi.resizeResults(detections, displaySize)
        const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
        let finalResult;
        results.forEach((result, i) => {
          const box = resizedDetections[i].detection.box
          const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
          finalResult = result;
          drawBox.draw(canvas)
        })  

        let url;
        let success;

        if(finalResult._distance < 0.6) {
          url = "/"
          success = ()=> {
            alert('Face matched! Login successful.')
            window.location.replace('/')
          }
        } else {
          url = "/auth/login"
          success = ()=> {
            alert('Face is not matching! Login again.')
            window.location.replace('/auth/login')
          }
        }
        
        
        document.getElementById('proceed').addEventListener('click',()=> {
          $.ajax({
            url: window.location.href,
            type: "POST",
            data: {
              conclusion : (finalResult._distance < 0.6)
            },
            dataType: 'json',
            success: success()
        })
        })
        
      })
    }

    function loadLabeledImages() {
      let labels = ["Sarthak Arora"];
      
      return Promise.all(

        labels.map(async label => {
          const descriptions = []
          let canvas = faceapi.createCanvasFromMedia(document.getElementById('Sarthak'));
          const detections = await faceapi.detectSingleFace(canvas).withFaceLandmarks().withFaceDescriptor()
          descriptions.push(detections.descriptor)
          // console.log(detections.descriptor)

          return new faceapi.LabeledFaceDescriptors(label, descriptions)
        })
      )
    }