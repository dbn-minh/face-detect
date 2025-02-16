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
        
        # Resize for better face detection (optional)
        scale = 1.5
        img_rd = cv2.resize(img_rd, (0, 0), fx=scale, fy=scale)

        # Detect faces in the image
        faces = detector(img_rd, 1)

        if len(faces) != 0:
            # Process the first detected face
            shape = predictor(img_rd, faces[0])
            face_descriptor = face_reco_model.compute_face_descriptor(img_rd, shape)
            face_descriptor = np.array(face_descriptor)
            return face_descriptor
        else:
            logging.warning(f"No face detected in the image from URL: {url}")
            return None
    except Exception as e:
        logging.error(f"Error processing image from URL: {url}: {str(e)}")
        return None

@app.route('/extract-vector', methods=['POST'])
def extract_vector():
    data = request.json
    file_urls = data.get('imageUrls')  # Expecting an array of URLs

    if not file_urls or not isinstance(file_urls, list):
        return jsonify({'message': 'fileUrls must be a list of image URLs'}), 400

    try:
        # Initialize a list to store feature vectors
        features_list = []

        # Process each URL
        for url in file_urls:
            # logging.info(f"Processing URL: {url}")
            feature_vector = return_128d_features_from_url(url)
            if feature_vector is not None:
                features_list.append(feature_vector)
        print(features_list)
        if features_list:
            # Calculate the mean feature vector
            features_mean = np.array(features_list, dtype=object).mean(axis=0)
            feature_vector_str = ','.join(map(str, features_mean))
            return jsonify({'meanFeatureVector': feature_vector_str}), 200
        else:
            return jsonify({'message': 'No valid faces detected in the provided images'}), 400

    except Exception as e:
        return jsonify({'message': f"Error processing feature vectors: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000)
