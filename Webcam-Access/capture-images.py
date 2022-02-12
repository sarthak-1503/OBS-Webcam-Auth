import cv2
import sys
import os
from pathlib import Path

cam = cv2.VideoCapture(0)

cv2.namedWindow("Video Capture")

img_counter = 0
cnt = 0

while True:
    ret, frame = cam.read()
    if not ret:
        print("failed to grab frame")
        break
    cv2.imshow("Video Capture", frame)

    k = cv2.waitKey(1)
    if k%256 == 27:
        # ESC pressed
        if cnt >= 1 : 
            print("Escape hit, closing...")
            break
    elif k%256 == 32:
        # SPACE pressed
        if not os.path.exists(str(Path.home()) + '/Desktop/' + sys.argv[2]):
            os.makedirs(str(Path.home()) + '/Desktop/' + sys.argv[2])
            
        img_name = sys.argv[1] + ".jpg"
        path = str(Path.home()) + '/Desktop/' + str(sys.argv[2])

        cv2.imwrite(os.path.join(path,img_name), frame)
        print("{} written!".format(img_name))
        img_counter += 1
        cnt+=1

cam.release()

cv2.destroyAllWindows()