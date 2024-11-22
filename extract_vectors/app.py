from flask import Flask, request, jsonify
import requests  # For downloading the image
from io import BytesIO
from PIL import Image
import dlib
import numpy as np
import cv2
import logging

app = Flask(__name__)

# Dlib face detector and models
detector = dlib.get_frontal_face_detector()
predictor = dlib.shape_predictor("data_dlib/shape_predictor_68_face_landmarks.dat")
face_reco_model = dlib.face_recognition_model_v1("data_dlib/dlib_face_recognition_resnet_model_v1.dat")

def return_128d_features_from_url(url):
    try:
        # Download the image from the URL
        response = requests.get(url)
        response.raise_for_status()  # Raise an error for bad responses
        
        img_data = BytesIO(response.content)
        img_rd = np.array(Image.open(img_data))  # Open the image as an array

        # Convert from RGB (PIL) to BGR (OpenCV)
        img_rd = cv2.cvtColor(img_rd, cv2.COLOR_RGB2BGR)

        # Detect faces in the image
        faces = detector(img_rd, 1)

        if len(faces) != 0:
            # Process the first detected face
            shape = predictor(img_rd, faces[0])
            face_descriptor = face_reco_model.compute_face_descriptor(img_rd, shape)
            face_descriptor = np.array(face_descriptor)
            feature_vector_str = ','.join(map(str, face_descriptor))  # Convert to string for API response
            return feature_vector_str
        else:
            logging.warning("No face detected in the image.")
            return None
    except Exception as e:
        logging.error(f"Error processing image from URL: {e}")
        return None

@app.route('/extract-vector', methods=['POST'])
def extract_vector():
    data = request.json
    file_url = data.get('fileUrl')

    if not file_url:
        return jsonify({'message': 'File URL is missing'}), 400

    try:
        # Log the received file URL
        print(f"Received fileUrl: {file_url}")

        # Extract the 128D feature vector
        feature_vector = return_128d_features_from_url(file_url)

        if feature_vector is None:
            return jsonify({'message': 'No face detected or processing error occurred.'}), 400

        # Log the extracted feature vector
        print(f"Extracted feature vector: {feature_vector}")

        return jsonify({'featureVector': feature_vector}), 200

    except Exception as e:
        return jsonify({'message': f"Error extracting feature vector: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000)
