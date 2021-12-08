import cv2
import sys
import os

cam = cv2.VideoCapture(0)

cv2.namedWindow("test")

img_counter = 0

while True:
    ret, frame = cam.read()
    if not ret:
        print("failed to grab frame")
        break
    cv2.imshow("test", frame)

    k = cv2.waitKey(1)
    if k%256 == 27:
        # ESC pressed
        print("Escape hit, closing...")
        break
    elif k%256 == 32:
        # SPACE pressed
        img_name = sys.argv[1] + ".jpg"
        cv2.imwrite(img_name, frame)
        os.rename("/home/sa-coder15/Desktop/Web-Development/OBS-Webcam-Auth/"+img_name, "/home/sa-coder15/Desktop/Web-Development/OBS-Webcam-Auth/public/photos/"+img_name)
        print("{} written!".format(img_name))
        img_counter += 1

cam.release()

cv2.destroyAllWindows()